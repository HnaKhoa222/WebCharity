import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ethers } from 'ethers';
import { doc, getDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { db } from '../../firebase';
import './Web3Payment.css';

const Web3Payment = () => {
  const { projectId } = useParams();
  const [amount, setAmount] = useState('');
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transactionStatus, setTransactionStatus] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  const contractAddress = '0xee3C2a39e2e49176D969A27E05F5e8CA975F14C2';
  const contractABI = [
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_name",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "_goal",
          "type": "uint256"
        }
      ],
      "name": "createProject",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_projectId",
          "type": "uint256"
        }
      ],
      "name": "donate",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "projectId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "donor",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "DonationReceived",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "projectId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "creator",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "FundsWithdrawn",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "goal",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "creator",
          "type": "address"
        }
      ],
      "name": "ProjectCreated",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_projectId",
          "type": "uint256"
        }
      ],
      "name": "withdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "donations",
      "outputs": [
        {
          "internalType": "address",
          "name": "donor",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_projectId",
          "type": "uint256"
        }
      ],
      "name": "getDonations",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "donor",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            }
          ],
          "internalType": "struct CharityHub.Donation[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_projectId",
          "type": "uint256"
        }
      ],
      "name": "getProject",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "goal",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "creator",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "totalDonated",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "completed",
              "type": "bool"
            }
          ],
          "internalType": "struct CharityHub.Project",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "projectCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "projects",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "goal",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "creator",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "totalDonated",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "completed",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const projectRef = doc(db, 'projects', projectId);
        const projectSnap = await getDoc(projectRef);
        if (projectSnap.exists()) {
          const data = projectSnap.data();
          // Lấy projectId từ smart contract
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const contract = new ethers.Contract(contractAddress, contractABI, provider);
          const projectCount = await contract.projectCount();
          
          // Tìm project ID trong smart contract
          let contractProjectId = 0;
          for (let i = 1; i <= projectCount; i++) {
            const project = await contract.getProject(i);
            if (project.name === data.title) {
              contractProjectId = i;
              break;
            }
          }

          setProject({
            ...data,
            contractProjectId, // Lưu ID từ smart contract
            raisedAmount: data.raisedAmount || '0 ETH',
            fundingGoal: data.fundingGoal || '0 ETH'
          });
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        setError('Không thể tải thông tin dự án');
      }
    };

    fetchProject();
  }, [projectId]);

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setWalletAddress(address);
        setIsConnected(true);
        setAddress(address);
      } else {
        setError('Vui lòng cài đặt MetaMask để thực hiện giao dịch');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError('Không thể kết nối ví');
    }
  };

  // Hàm lắng nghe sự kiện DonationReceived
  const listenToDonationEvents = async (contract) => {
    try {
      // Lắng nghe sự kiện mới
      contract.on("DonationReceived", async (contractProjectId, donor, amount, timestamp) => {
        console.log("New donation received:", {
          contractProjectId: contractProjectId.toString(),
          donor,
          amount: ethers.utils.formatEther(amount),
          timestamp: new Date(timestamp.toNumber() * 1000).toISOString()
        });

        // Kiểm tra xem projectId có khớp với dự án hiện tại không
        if (contractProjectId.toString() === project.contractProjectId.toString()) {
          // Cập nhật Firebase
          const donationData = {
            donorAddress: donor,
            amount: ethers.utils.formatEther(amount),
            amountInWei: amount.toString(),
            timestamp: timestamp.toNumber() * 1000,
            transactionHash: null, // Sẽ được cập nhật sau khi có receipt
            blockNumber: null, // Sẽ được cập nhật sau khi có receipt
            status: 'pending'
          };

          await updateDoc(doc(db, 'projects', projectId), {
            donations: arrayUnion(donationData)
          });

          // Cập nhật UI
          setTransactions(prev => [donationData, ...prev]);
        }
      });
    } catch (error) {
      console.error("Error listening to events:", error);
    }
  };

  // Hàm lấy lịch sử giao dịch từ Firebase
  const fetchTransactions = async () => {
    try {
      setIsLoadingTransactions(true);
      const projectRef = doc(db, 'projects', projectId);
      const projectSnap = await getDoc(projectRef);
      
      if (projectSnap.exists()) {
        const data = projectSnap.data();
        const donations = data.donations || [];
        setTransactions(donations);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  useEffect(() => {
    const setupContract = async () => {
      if (window.ethereum && project?.contractProjectId) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, contractABI, provider);
        await listenToDonationEvents(contract);
      }
    };

    setupContract();
    fetchTransactions();

    // Cleanup listener khi component unmount
    return () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, contractABI, provider);
        contract.removeAllListeners("DonationReceived");
      }
    };
  }, [projectId, project?.contractProjectId]);

  const handleDonation = async () => {
    if (!isConnected) {
      alert('Vui lòng kết nối ví trước khi quyên góp');
      return;
    }

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Vui lòng nhập số lượng ETH hợp lệ');
      return;
    }

    if (!project?.contractProjectId) {
      setError('Không tìm thấy ID dự án trong smart contract');
      return;
    }

    try {
      setTransactionStatus('pending');
      setError(null);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const amountInWei = ethers.utils.parseEther(amount);

      const tx = await contract.donate(project.contractProjectId, {
        value: amountInWei,
        gasLimit: 300000
      });

      setTransactionStatus('processing');
      const receipt = await tx.wait();
      setTransactionStatus('success');

      // Cập nhật thông tin giao dịch trong Firebase
      const donationData = {
        donorAddress: address,
        amount: amount,
        amountInWei: amountInWei.toString(),
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        timestamp: Date.now(),
        status: 'completed'
      };

      await updateDoc(doc(db, 'projects', projectId), {
        totalDonations: increment(parseFloat(amount)),
        donations: arrayUnion(donationData)
      });

      // Cập nhật UI
      setProject(prev => ({
        ...prev,
        totalDonations: (parseFloat(prev.totalDonations) + parseFloat(amount)).toString()
      }));

      // Reset amount after successful donation
      setAmount('');

    } catch (err) {
      console.error('Lỗi giao dịch:', err);
      setError(err.message);
      setTransactionStatus('error');
    }
  };

  // Component hiển thị lịch sử giao dịch
  const TransactionHistory = () => {
    if (isLoadingTransactions) {
      return <div>Đang tải lịch sử giao dịch...</div>;
    }

    return (
      <div className="transaction-history">
        <h3>Lịch sử giao dịch</h3>
        {transactions.length === 0 ? (
          <p>Chưa có giao dịch nào</p>
        ) : (
          <div className="transactions-list">
            {transactions.map((tx, index) => (
              <div key={index} className="transaction-item">
                <p>Người quyên góp: {tx.donorAddress.substring(0, 6)}...{tx.donorAddress.substring(tx.donorAddress.length - 4)}</p>
                <p>Số tiền: {tx.amount} ETH</p>
                <p>Thời gian: {new Date(tx.timestamp).toLocaleString()}</p>
                {tx.transactionHash && (
                  <a 
                    href={`https://sepolia.etherscan.io/tx/${tx.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transaction-link"
                  >
                    Xem trên Etherscan
                  </a>
                )}
                <span className={`transaction-status ${tx.status}`}>
                  {tx.status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!project) {
    return <div className="web3-payment">Đang tải thông tin dự án...</div>;
  }

  return (
    <div className="web3-payment">
      <h2>Quyên góp cho dự án: {project.title}</h2>
      <p className="project-description">{project.description}</p>
      
      <div className="project-info">
        <p>Mục tiêu: {project.fundingGoal}</p>
        <p>Đã quyên góp: {project.raisedAmount}</p>
        <p>Tiến độ: {project.raisedPercent}</p>
        <p className="creator-address">
          Địa chỉ ví nhận tiền: {project.creatorAddress}
          <span className="copy-address" onClick={() => {
            navigator.clipboard.writeText(project.creatorAddress);
            alert('Đã sao chép địa chỉ ví');
          }}>
            📋
          </span>
        </p>
      </div>

      <div className="payment-form">
        <div className="wallet-section">
          {!isConnected ? (
            <button 
              className="connect-wallet-button"
              onClick={connectWallet}
              disabled={loading}
            >
              Kết nối ví
            </button>
          ) : (
            <p className="wallet-address">Ví đã kết nối: {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}</p>
          )}
        </div>

        <div className="amount-section">
          <input
            type="number"
            step="0.001"
            min="0.001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Nhập số lượng ETH"
            className="amount-input"
          />
          <p className="amount-hint">Số lượng tối thiểu: 0.001 ETH</p>
        </div>

        <button 
          className="donate-button"
          onClick={handleDonation}
          disabled={loading || !isConnected || !amount}
        >
          {loading ? 'Đang xử lý...' : `Quyên góp ${amount || '0'} ETH`}
        </button>

        {error && <p className="error">{error}</p>}
        {transactionStatus && <p className="transaction-status">{transactionStatus}</p>}
      </div>

      <TransactionHistory />
    </div>
  );
};

export default Web3Payment; 