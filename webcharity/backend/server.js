const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const { ethers } = require('ethers');

const app = express();
app.use(cors());
app.use(express.json());

const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// Search and filter projects
app.get('/api/projects/search', async (req, res) => {
  try {
    const { 
      searchTerm, 
      sortBy = 'newest',
      limit = 20,
      page = 1 
    } = req.query;

    let query = db.collection('projects');

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        query = query.orderBy('createdAt', 'desc');
        break;
      case 'popular':
        query = query.orderBy('supporters', 'desc');
        break;
      case 'deadline':
        query = query.orderBy('deadline', 'asc');
        break;
      case 'amount':
        query = query.orderBy('raisedAmount', 'desc');
        break;
      default:
        query = query.orderBy('createdAt', 'desc');
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.limit(parseInt(limit)).offset(offset);

    const querySnapshot = await query.get();
    let projects = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Apply search filter if searchTerm is provided
    if (searchTerm && searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      projects = projects.filter(project => {
        return (
          (project.title && project.title.toLowerCase().includes(term)) ||
          (project.fundName && project.fundName.toLowerCase().includes(term)) ||
          (project.description && project.description.toLowerCase().includes(term)) ||
          (project.category && project.category.toLowerCase().includes(term)) ||
          (project.location && project.location.toLowerCase().includes(term))
        );
      });
    }

    // Get total count for pagination
    const totalQuery = db.collection('projects');
    const totalSnapshot = await totalQuery.get();
    const total = totalSnapshot.size;

    res.json({
      projects,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error searching projects:', error);
    res.status(500).json({ error: 'Failed to search projects' });
  }
});

// Verify transaction on blockchain
app.post('/verify-transaction', async (req, res) => {
  const { transactionHash, projectId } = req.body;
  
  try {
    // Connect to Ethereum network (using Infura or other provider)
    const provider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
    
    // Get transaction receipt
    const receipt = await provider.getTransactionReceipt(transactionHash);
    
    if (!receipt) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    if (receipt.status === 0) {
      return res.status(400).json({ error: 'Transaction failed' });
    }
    
    // Get transaction details
    const tx = await provider.getTransaction(transactionHash);
    
    // Update project in Firestore
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();
    
    if (projectDoc.exists()) {
      const projectData = projectDoc.data();
      const amountInEth = ethers.utils.formatEther(tx.value);
      
      // Update project with transaction details
      await projectRef.update({
        transactions: admin.firestore.FieldValue.arrayUnion({
          donorName: tx.from.substring(0, 6) + '...' + tx.from.substring(tx.from.length - 4),
          amount: `${amountInEth} ETH`,
          date: new Date().toLocaleDateString('vi-VN'),
          transactionHash: transactionHash,
          status: 'completed'
        })
      });
      
      return res.json({ 
        status: 'success', 
        message: 'Transaction verified and recorded',
        transaction: {
          hash: transactionHash,
          from: tx.from,
          to: tx.to,
          value: amountInEth,
          status: 'completed'
        }
      });
    } else {
      return res.status(404).json({ error: 'Project not found' });
    }
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return res.status(500).json({ error: 'Failed to verify transaction' });
  }
});

// Get transaction history for a project
app.get('/project-transactions/:projectId', async (req, res) => {
  const { projectId } = req.params;
  
  try {
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();
    
    if (projectDoc.exists()) {
      const projectData = projectDoc.data();
      return res.json({ 
        transactions: projectData.transactions || [] 
      });
    } else {
      return res.status(404).json({ error: 'Project not found' });
    }
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});