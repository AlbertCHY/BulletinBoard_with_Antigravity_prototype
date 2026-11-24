import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Select, Modal, Form, Input, Checkbox, message, Popconfirm, Layout, Typography } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { fetchAnnouncements, deleteAnnouncement, createAnnouncement, updateAnnouncement } from '../api';
import { useAuth } from '../contexts/AuthContext';

const { Option } = Select;
const { TextArea } = Input;

const CATEGORY_COLORS = {
    Maintenance: 'orange',
    Urgent: 'red',
    General: 'blue',
    Deployment: 'green',
};

const AnnouncementTable = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterCategory, setFilterCategory] = useState(null);
    const { user } = useAuth();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [editingId, setEditingId] = useState(null);
    const [form] = Form.useForm();

    // Content View State
    const [viewingContent, setViewingContent] = useState(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const announcements = await fetchAnnouncements(filterCategory);
            setData(announcements);
        } catch (error) {
            message.error('Failed to load announcements');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [filterCategory]);

    const handleDelete = async (id) => {
        try {
            await deleteAnnouncement(id);
            message.success('Announcement deleted');
            loadData();
        } catch (error) {
            message.error('Failed to delete');
        }
    };

    const handleEdit = (record) => {
        setModalMode('edit');
        setEditingId(record.id);
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setModalMode('create');
        setEditingId(null);
        form.resetFields();
        form.setFieldsValue({ is_active: true, category: 'General' }); // Defaults
        setIsModalOpen(true);
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            if (modalMode === 'create') {
                await createAnnouncement(values);
                message.success('Announcement created');
            } else {
                await updateAnnouncement(editingId, values);
                message.success('Announcement updated');
            }
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            console.log('Validate Failed:', error);
        }
    };

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            width: '20%',
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            width: '10%',
            render: (category) => (
                <Tag color={CATEGORY_COLORS[category] || 'default'}>
                    {category}
                </Tag>
            ),
        },
        {
            title: 'Content',
            dataIndex: 'content',
            key: 'content',
            ellipsis: true,
            render: (text) => (
                <span
                    style={{ cursor: 'pointer', color: '#1890ff' }}
                    onClick={() => setViewingContent(text)}
                    title="Click to read full content"
                >
                    {text}
                </span>
            ),
        },
        {
            title: 'Target Hosts',
            dataIndex: 'target_hosts',
            key: 'target_hosts',
            width: '15%',
        },
        {
            title: 'Status',
            dataIndex: 'is_active',
            key: 'is_active',
            width: '10%',
            render: (isActive) => (
                <Tag color={isActive ? 'success' : 'default'}>
                    {isActive ? 'Active' : 'Inactive'}
                </Tag>
            ),
        },
    ];

    if (user) {
        columns.push({
            title: 'Action',
            key: 'action',
            width: '15%',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
                    <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.id)}>
                        <Button type="link" danger>Delete</Button>
                    </Popconfirm>
                </Space>
            ),
        });
    }

    return (
        <div style={{ padding: '24px', background: '#141414', minHeight: '100%', borderRadius: '8px' }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Space>
                    <Select
                        placeholder="Filter by Category"
                        style={{ width: 200 }}
                        allowClear
                        onChange={setFilterCategory}
                    >
                        <Option value="Maintenance">Maintenance</Option>
                        <Option value="Urgent">Urgent</Option>
                        <Option value="General">General</Option>
                        <Option value="Deployment">Deployment</Option>
                    </Select>
                    <Button icon={<ReloadOutlined />} onClick={loadData} />
                </Space>
                {user && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                        Add Announcement
                    </Button>
                )}
            </div>
            <Table
                columns={columns}
                dataSource={data}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title={modalMode === 'create' ? "Create Announcement" : "Edit Announcement"}
                open={isModalOpen}
                onOk={handleModalOk}
                onCancel={() => setIsModalOpen(false)}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                        <Select>
                            <Option value="Maintenance">Maintenance</Option>
                            <Option value="Urgent">Urgent</Option>
                            <Option value="General">General</Option>
                            <Option value="Deployment">Deployment</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="content" label="Content" rules={[{ required: true }]}>
                        <TextArea rows={4} />
                    </Form.Item>
                    <Form.Item name="target_hosts" label="Target Hosts">
                        <Input placeholder="e.g. host1, host2" />
                    </Form.Item>
                    <Form.Item name="is_active" valuePropName="checked">
                        <Checkbox>Active</Checkbox>
                    </Form.Item>
                </Form>
            </Modal>

            {/* View Content Modal */}
            <Modal
                title="Announcement Details"
                open={!!viewingContent}
                onCancel={() => setViewingContent(null)}
                footer={[
                    <Button key="close" onClick={() => setViewingContent(null)}>
                        Close
                    </Button>
                ]}
            >
                <p style={{ whiteSpace: 'pre-wrap' }}>{viewingContent}</p>
            </Modal>
        </div>
    );
};

export default AnnouncementTable;
