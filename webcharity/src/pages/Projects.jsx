import React, { useState } from "react";
import "./Projects.css";

const ProjectsPage = () => {
    const [projectList, setProjectList] = useState([
        {
            id: 1,
            name: "Dự án 1",
            description: "Mô tả dự án 1",
            progress: 75,
            amount: "00,000,000 VND",
            targetAmount: "000,000,000 VND",
            detailsLink: "http://example.com/project1",
            statementLink: "http://example.com/statement1",
            qrCode: "http://example.com/qr1.png",
            isInterested: false,
        },
        {
            id: 2,
            name: "Dự án 2",
            description: "Mô tả dự án 2",
            progress: 50,
            amount: "00,000,000 VND",
            targetAmount: "000,000,000 VND",
            detailsLink: "http://example.com/project2",
            statementLink: "http://example.com/statement2",
            qrCode: "http://example.com/qr2.png",
            isInterested: false,
        },
        {
            id: 3,
            name: "Dự án 3",
            description: "Mô tả dự án 3",
            progress: 90,
            amount: "00,000,000 VND",
            targetAmount: "000,000,000 VND",
            detailsLink: "http://example.com/project3",
            statementLink: "http://example.com/statement3",
            qrCode: "http://example.com/qr3.png",
            isInterested: false,
        },
    ]);

    const [selectedQr, setSelectedQr] = useState(null);

    const handleInterestToggle = (projectId) => {
        setProjectList((prevList) =>
            prevList.map((project) =>
                project.id === projectId
                    ? { ...project, isInterested: !project.isInterested }
                    : project
            )
        );
    };

    const toggleQrCode = (qrCode) => {
        setSelectedQr(selectedQr === qrCode ? null : qrCode);
    };

    return (
        <div className="projects-page">
            <h1>Dự án đang gây quỹ</h1>
            <p>Hãy lựa chọn đồng hành cùng dự án mà bạn quan tâm</p>
            <div className="project-list">
                {projectList.map((project) => (
                    <div key={project.id} className="project-item">
                        <div className="project-image-placeholder"></div>

                        <h3>Tên Quỹ</h3>
                        <h2>{project.name}</h2>

                        <button
                            onClick={() => handleInterestToggle(project.id)}
                            className={`interest-btn ${project.isInterested ? "interested" : ""}`}
                        >
                            <span className="interest-icon">
                                {project.isInterested ? "✓" : "+"}
                            </span>
                        </button>

                        <div className="progress">
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${project.progress}%` }}
                                />
                            </div>
                            <p className="amount">{project.amount}</p>
                            <p className="target">
                                với mục tiêu {project.targetAmount}
                            </p>
                        </div>

                        <div className="project-actions">
                            <div className="action-buttons">
                                <a href={project.detailsLink} className="button details-btn">
                                    Xem chi tiết
                                </a>
                                <a href={project.statementLink} className="button statement-btn">
                                    Kiểm tra sao kê
                                </a>
                                <button
                                    onClick={() => toggleQrCode(project.qrCode)}
                                    className="button qr-btn"
                                >
                                    {selectedQr === project.qrCode ? "Đóng mã QR" : "Mở mã QR"}
                                </button>
                            </div>
                        </div>

                        {selectedQr === project.qrCode && (
                            <div className="qr-code">
                                <img src={project.qrCode} alt={`QR Code for ${project.name}`} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="view-all">
                <button className="button view-all-btn">Xem tất cả</button>
            </div>
        </div>
    );
};

export default ProjectsPage;