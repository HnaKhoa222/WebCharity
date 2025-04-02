const puppeteer = require('puppeteer');
const admin = require('firebase-admin');

const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

async function scrapeProjects() {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const projectsUrl = 'https://givenow.vn/du-an';
    console.log(`Truy cập: ${projectsUrl}`);
    await page.goto(projectsUrl, { waitUntil: 'networkidle2', timeout: 60000 });

    console.log('Chuyển sang tab campaigns-running');
    await page.evaluate(() => {
      const tab = document.querySelector('#campaigns-running');
      if (tab) tab.style.display = 'block';
    });
    await page.waitForSelector('#campaigns-running .product.type-product', { timeout: 10000 });

    let html = await page.content();
    let $ = require('cheerio').load(html);

    const projects = [];
    $('#campaigns-running .product.type-product').each((i, element) => {
      const project = {};
      project.title = $(element).find('.woocommerce-loop-product__title a').text().trim();
      project.projectLink = $(element).find('.woocommerce-loop-product__title a').attr('href');
      project.image = $(element).find('.progression-studios-store-image-index img').attr('src');
      project.category = $(element).find('.funlin-shop-index-category li a').text().trim();
      project.fundName = $(element).find('.progression-studios-shop-author-byline a').text().trim();
      project.fundLink = $(element).find('.progression-studios-shop-author-byline a').attr('href');
      project.fundAvatar = $(element).find('.progression-studios-shop-author-avatar img').attr('src');
      project.raisedPercent = $(element).find('.progression-studios-raised-percent').text().trim();
      project.raisedAmount = $(element).find('.progression-studios-fund-raised .woocommerce-Price-amount').text().trim();
      project.fundingGoal = $(element).find('.progression-studios-funding-goal .woocommerce-Price-amount').text().trim();
      projects.push(project);
    });

    console.log(`Tìm thấy ${projects.length} dự án đang gây quỹ`);

    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      console.log(`Dự án ${i + 1}/${projects.length}: ${project.title}`);

      console.log(`Truy cập: ${project.projectLink}`);
      try {
        await page.goto(project.projectLink, { waitUntil: 'networkidle2', timeout: 60000 });
      } catch (e) {
        console.error(`Lỗi tải trang chi tiết ${project.title}: ${e.message}`);
        continue;
      }

      console.log('Chuyển sang tab giao dịch');
      await page.evaluate(() => {
        const bakerTab = document.querySelector('#wpneo-tab-baker_list');
        if (bakerTab) bakerTab.style.display = 'block';
      });

      try {
        await page.waitForSelector('#wpneo-tab-baker_list #order-table', { timeout: 10000 });
      } catch (e) {
        console.error(`Không tìm thấy bảng giao dịch cho ${project.title}: ${e.message}`);
        project.transactions = [];
        continue;
      }

      const maxPage = await page.evaluate(() => {
        const pagination = document.querySelector('.wpneo-pagination .page-numbers[max-page]');
        return pagination ? parseInt(pagination.getAttribute('max-page')) : 1;
      });
      console.log(`Tổng số trang giao dịch: ${maxPage}`);

      const allTransactions = [];
      let previousContent = '';

      for (let currentPage = 1; currentPage <= maxPage; currentPage++) {
        console.log(`Scraping giao dịch trang ${currentPage}/${maxPage}`);

        await page.waitForSelector('#wpneo-tab-baker_list #order-table', { timeout: 10000 });
        const transactionHtml = await page.content();
        $ = require('cheerio').load(transactionHtml);

        let foundTransactions = false;
        $('#wpneo-tab-baker_list #order-table tbody tr').each((i, element) => {
          const donorName = $(element).find('.spt-name-sib').text().trim();
          const amount = $(element).find('.baker-donate-money .woocommerce-Price-amount').text().trim();
          const date = $(element).find('.baker-donate-date').text().trim();

          if (donorName && amount && date) {
            allTransactions.push({
              donorName,
              amount,
              date,
              scrapedAt: new Date().toISOString(),
            });
            foundTransactions = true;
          }
        });

        if (!foundTransactions) {
          console.log(`Không tìm thấy giao dịch ở trang ${currentPage}`);
        } else {
          console.log(`Tìm thấy ${$('#wpneo-tab-baker_list #order-table tbody tr').length} hàng giao dịch ở trang ${currentPage}`);
        }

        const currentContent = $('#wpneo-tab-baker_list #order-table').html();
        if (currentContent === previousContent && currentPage > 1) {
          console.log(`Nội dung bảng không thay đổi ở trang ${currentPage}, dừng lại`);
          break;
        }
        previousContent = currentContent;

        if (currentPage < maxPage) {
          const nextButton = await page.$('.wpneo-pagination .next .page-numbers');
          if (nextButton) {
            console.log('Nhấn nút "Tiếp theo"');
            await nextButton.click();

            try {
              await page.waitForFunction(
                (prev) => document.querySelector('#wpneo-tab-baker_list #order-table').innerHTML !== prev,
                { timeout: 15000 },
                previousContent
              );
              console.log(`Bảng giao dịch đã cập nhật cho trang ${currentPage + 1}`);
            } catch (e) {
              console.log(`Không thấy bảng giao dịch cập nhật sau khi nhấn "Tiếp theo": ${e.message}`);
              break;
            }

          } else {
            console.log('Không tìm thấy nút "Tiếp theo", dừng lại.');
            break;
          }
        }
      }

      project.transactions = allTransactions;
      console.log(`Tổng cộng tìm thấy ${allTransactions.length} giao dịch cho ${project.title}`);

      const numberedId = `project-${i + 1}`; // Đánh số từ 1
      const projectRef = db.collection('projects').doc(numberedId);
      await projectRef.set(project, { merge: true });
      console.log(`Đã lưu ${project.title} với ID: ${numberedId} và ${allTransactions.length} giao dịch`);

      console.log('Đợi 2 giây trước dự án tiếp theo...');
    }

    await browser.close();
    console.log('Hoàn tất scrape.');
  } catch (error) {
    console.error('Lỗi khi scrape:', error);
  }
}

scrapeProjects();