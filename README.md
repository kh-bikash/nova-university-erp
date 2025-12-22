# 🎓 Nova University ERP

![Nova University Banner](https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1200&auto=format&fit=crop)

> **Next-Generation University Management System** designed to streamline administration, empower faculty, and enhance the student learning experience.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)

## 🚀 Overview

**Nova University ERP** is a comprehensive, all-in-one platform handling every aspect of modern university operations. From complex academic grading systems to automated fee management and hostel allocation, it provides a seamless interface for all stakeholders.

### ✨ Key Features

#### 👨‍🎓 For Students
*   **Academic Dashboard**: Real-time view of attendance, grades, and CGPA.
*   **Course Registration**: One-click enrollment in electives and core courses.
*   **Digital Wallet**: Fee payments, transaction history, and detailed receipts.
*   **Campus Life**: Hostel room booking, transport route subscriptions, and library access.

#### 👩‍🏫 For Faculty
*   **Classroom Management**: Digital attendance marking and dynamic timetabling.
*   **Grading System**: Automated grade calculation and marksheet generation.
*   **Resource Sharing**: Upload lecture notes, assignments, and exam papers.

#### 🏛️ For Administrators
*   **Centralized Control**: specific roles for Registrar, Dean, and Department Heads.
*   **Detailed Analytics**: Reports on student performance, faculty efficiency, and financial health.
*   **Infrastructure**: specific modules for Transport, Hostel, and Inventory management.

## 🛠️ Tech Stack

*   **Frontend**: Next.js 15 (App Router), React, Tailwind CSS, Lucide Icons, ShadCN UI
*   **Backend**: Next.js API Routes, Server Actions
*   **Database**: PostgreSQL
*   **Authentication**: Custom Role-Based Access Control (RBAC)

## 🏁 Getting Started

### Prerequisites

*   Node.js 18+
*   PostgreSQL Database

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/kh-bikash/nova-university-erp.git
    cd nova-university-erp
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/nova_erp"
    JWT_SECRET="your-super-secret-key"
    ```

4.  **Run Migrations**
    ```bash
    npm run migrate
    ```

5.  **Start the Development Server**
    ```bash
    npm run dev
    ```

    Visit `http://localhost:3000` to see the application in action.

## 📸 Screenshots

*(Add screenshots of your Landing Page, Dashboard, and Mobile View here)*

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ by the Nova University Tech Team
</p>
