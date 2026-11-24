import React from 'react';
import { ConfigProvider, Layout, theme, Button, Space, Menu } from 'antd';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import AnnouncementTable from './components/AnnouncementTable';
import LoginPage from './components/LoginPage';
import FaqPage from './components/FaqPage';
import CommonWebsitesPage from './components/CommonWebsitesPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const { Header, Content } = Layout;

const AppHeader = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', marginRight: '32px' }}>
                    <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Ops Dashboard</Link>
                </div>
                <Space size="large">
                    <Link to="/" style={{ color: '#ccc', fontSize: '16px' }}>Home</Link>
                    <Link to="/faqs" style={{ color: '#ccc', fontSize: '16px' }}>FAQs</Link>
                    <Link to="/websites" style={{ color: '#ccc', fontSize: '16px' }}>Common Websites</Link>
                </Space>
            </div>
            <div>
                {user ? (
                    <Space>
                        <span style={{ color: 'white' }}>Welcome, {user.username}</span>
                        <Button type="link" onClick={handleLogout}>Logout</Button>
                    </Space>
                ) : (
                    // Only show login button if not on login page? 
                    // Or just nothing since redirect happens usually. 
                    // But for manual navigation:
                    <Link to="/login"><Button type="primary">Login</Button></Link>
                )}
            </div>
        </Header>
    );
};

const MainLayout = ({ children }) => {
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <AppHeader />
            <Content style={{ padding: '24px' }}>
                {children}
            </Content>
        </Layout>
    );
};

function App() {
    return (
        <ConfigProvider
            theme={{
                algorithm: theme.darkAlgorithm,
                token: {
                    colorPrimary: '#1890ff',
                },
            }}
        >
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/" element={
                            <MainLayout>
                                <AnnouncementTable />
                            </MainLayout>
                        } />
                        <Route path="/faqs" element={
                            <MainLayout>
                                <FaqPage />
                            </MainLayout>
                        } />
                        <Route path="/websites" element={
                            <MainLayout>
                                <CommonWebsitesPage />
                            </MainLayout>
                        } />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </ConfigProvider>
    );
}

export default App;

