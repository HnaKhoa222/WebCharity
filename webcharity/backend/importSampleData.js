const admin = require('firebase-admin');
const { sampleProjects } = require('./sampleData');

// Khởi tạo Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function importSampleData() {
  try {
    console.log('Bắt đầu import dữ liệu mẫu...');
    
    const batch = db.batch();
    
    sampleProjects.forEach((project) => {
      const docRef = db.collection('projects').doc(project.id);
      batch.set(docRef, {
        ...project,
        createdAt: admin.firestore.Timestamp.fromDate(project.createdAt),
        deadline: admin.firestore.Timestamp.fromDate(project.deadline),
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    
    await batch.commit();
    
    console.log(`✅ Đã import thành công ${sampleProjects.length} dự án mẫu vào Firestore!`);
    console.log('\n📊 Thống kê dữ liệu:');
    console.log('- Giáo dục:', sampleProjects.filter(p => p.category === 'education').length, 'dự án');
    console.log('- Trẻ em:', sampleProjects.filter(p => p.category === 'children').length, 'dự án');
    console.log('- Môi trường:', sampleProjects.filter(p => p.category === 'environment').length, 'dự án');
    
  } catch (error) {
    console.error('❌ Lỗi khi import dữ liệu:', error);
  } finally {
    process.exit(0);
  }
}

// Chạy script
importSampleData(); 