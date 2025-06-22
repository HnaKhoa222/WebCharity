import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { db, auth, storage } from "../firebase";
import { collection, addDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../contexts/AuthContext";
import "./Create.css";

const CreatePage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    fundingGoal: "",
    category: "",
    startDate: "",
    endDate: "",
    logo: null,
    logoPreview: null,
    creatorName: "",
    creatorEmail: "",
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitStatus, setSubmitStatus] = useState(null);

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
    const fetchUserData = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Cập nhật form với thông tin người dùng
            setFormData(prev => ({
              ...prev,
              creatorName: userData.username || "",
              creatorEmail: userData.email || currentUser.email || "",
            }));
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, [currentUser]);

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setWalletAddress(address);
      } else {
        setError("Vui lòng cài đặt MetaMask để tạo dự án");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setError("Không thể kết nối ví");
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'logo' && files && files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          logo: files[0],
          logoPreview: reader.result
        }));
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!walletAddress) {
      setError("Vui lòng kết nối ví MetaMask");
      return;
    }

    if (!currentUser) {
      setError("Vui lòng đăng nhập để tạo dự án");
      return;
    }

    setLoading(true);
    setError("");
    setSubmitStatus(null);

    try {
      // 1. Create project on blockchain
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      
      const goalInWei = ethers.utils.parseEther(formData.fundingGoal);
      const tx = await contract.createProject(formData.title, goalInWei);
      
      // Đợi transaction được xác nhận
      const receipt = await tx.wait();
      
      // 2. Get project ID from blockchain
      const projectCount = await contract.projectCount();
      const blockchainProjectId = projectCount.toNumber() - 1;

      // 3. Create project in Firestore
      const projectData = {
        title: formData.title,
        description: formData.description,
        fundingGoal: formData.fundingGoal + " ETH",
        category: formData.category,
        startDate: formData.startDate,
        endDate: formData.endDate,
        blockchainProjectId,
        creatorId: currentUser.uid,
        creatorAddress: walletAddress,
        creatorName: formData.creatorName || currentUser.displayName || "Người dùng",
        creatorEmail: formData.creatorEmail || currentUser.email,
        raisedAmount: "0 ETH",
        raisedPercent: "0%",
        status: "active",
        createdAt: serverTimestamp(),
        donations: []
      };

      const docRef = await addDoc(collection(db, "projects"), projectData);
      
      setSubmitStatus("Dự án đã được tạo thành công!");
      navigate(`/projects/${docRef.id}`);
    } catch (error) {
      console.error("Error creating project:", error);
      setError(`Lỗi khi tạo dự án: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-page">
      <h1>Tạo Dự Án Mới</h1>
      <p>Điền thông tin chi tiết để tạo dự án quyên góp</p>

      <div className="wallet-section">
        {!walletAddress ? (
          <button 
            className="connect-wallet-button"
            onClick={connectWallet}
            disabled={loading}
          >
            Kết nối ví
          </button>
        ) : (
          <p className="wallet-address">
            Ví đã kết nối: {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
          </p>
        )}
      </div>

      <form className="create-form" onSubmit={handleSubmit}>
        <h2>Thông Tin Cơ Bản</h2>
        <div className="form-group">
          <label htmlFor="title">Tên Dự Án</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Nhập tên dự án"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Mô Tả Dự Án</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Nhập mô tả dự án"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="fundingGoal">Mục Tiêu Gây Quỹ (ETH)</label>
          <input
            type="number"
            id="fundingGoal"
            name="fundingGoal"
            value={formData.fundingGoal}
            onChange={handleChange}
            placeholder="Ví dụ: 1.5"
            min="0.01"
            step="0.01"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Danh Mục</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Chọn danh mục</option>
            <option value="education">Giáo dục</option>
            <option value="health">Y tế</option>
            <option value="environment">Môi trường</option>
            <option value="community">Cộng đồng</option>
            <option value="other">Khác</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="startDate">Ngày Bắt Đầu</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="endDate">Ngày Kết Thúc</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="logo">Logo Dự Án</label>
          <div className="logo-upload-container">
            <input
              type="file"
              id="logo"
              name="logo"
              accept="image/*"
              onChange={handleChange}
              className="logo-input"
            />
            {formData.logoPreview && (
              <div className="logo-preview">
                <img src={formData.logoPreview} alt="Logo preview" />
              </div>
            )}
          </div>
          <p className="form-hint">Tải lên logo cho dự án của bạn (khuyến nghị: 500x500px)</p>
        </div>

        <button 
          type="submit" 
          className="submit-button"
          disabled={loading || !walletAddress || !currentUser}
        >
          {loading ? "Đang tạo..." : "Tạo dự án"}
        </button>

        {error && <p className="error">{error}</p>}
        {submitStatus && <p className="success">{submitStatus}</p>}
      </form>
    </div>
  );
};

export default CreatePage;
