import React, { useState, useEffect } from 'react';
import { Collapse, Typography, Button, Space, Modal, Form, Input, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { fetchFaqs, createFaq, updateFaq, deleteFaq } from '../api';
import { useAuth } from '../contexts/AuthContext';

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;
const { TextArea } = Input;

const FaqPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  const loadFaqs = async () => {
    setLoading(true);
    try {
      const data = await fetchFaqs();
      setFaqs(data);
    } catch (error) {
      message.error('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteFaq(id);
      message.success('FAQ deleted');
      loadFaqs();
    } catch (error) {
      message.error('Failed to delete FAQ');
    }
  };

  const handleEdit = (faq, e) => {
    e.stopPropagation(); // Prevent panel from toggling
    setModalMode('edit');
    setEditingId(faq.id);
    form.setFieldsValue(faq);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setModalMode('create');
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ is_active: true });
    setIsModalOpen(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (modalMode === 'create') {
        await createFaq(values);
        message.success('FAQ created');
      } else {
        await updateFaq(editingId, values);
        message.success('FAQ updated');
      }
      setIsModalOpen(false);
      loadFaqs();
    } catch (error) {
      console.log('Validate Failed:', error);
    }
  };

  const genExtra = (faq) => {
    if (!user) return null;
    return (
      <Space>
        <Button 
          type="link" 
          icon={<EditOutlined />} 
          onClick={(e) => handleEdit(faq, e)} 
        />
        <Popconfirm 
          title="Sure to delete?" 
          onConfirm={(e) => { e.stopPropagation(); handleDelete(faq.id); }}
          onCancel={(e) => e.stopPropagation()}
        >
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={(e) => e.stopPropagation()} 
          />
        </Popconfirm>
      </Space>
    );
  };

  return (
    <div style={{ padding: '24px', background: '#141414', minHeight: '100%', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ color: '#fff', margin: 0 }}>Frequently Asked Questions</Title>
        {user && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Add FAQ
          </Button>
        )}
      </div>

      <Collapse accordion theme="dark" bordered={false}>
        {faqs.map(faq => (
          <Panel header={faq.question} key={faq.id} extra={genExtra(faq)}>
            <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
              {faq.answer}
            </Paragraph>
          </Panel>
        ))}
      </Collapse>
      
      {faqs.length === 0 && !loading && (
          <Paragraph style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>
              No FAQs available.
          </Paragraph>
      )}

      {/* Create/Edit Modal */}
      <Modal
        title={modalMode === 'create' ? "Create FAQ" : "Edit FAQ"}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="question" label="Question" rules={[{ required: true, message: 'Please enter the question' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="answer" label="Answer" rules={[{ required: true, message: 'Please enter the answer' }]}>
             <TextArea rows={6} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FaqPage;
