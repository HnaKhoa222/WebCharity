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