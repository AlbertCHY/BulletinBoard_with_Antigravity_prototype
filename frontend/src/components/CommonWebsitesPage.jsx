import React from 'react';
import { List, Typography, Card } from 'antd';
import { LinkOutlined } from '@ant-design/icons';

const { Title } = Typography;

const CommonWebsitesPage = () => {
  const data = [
    {
      title: 'Internal Wiki / Confluence',
      url: 'https://wiki.example.com',
      description: 'Documentation, runbooks, and team directories.',
    },
    {
      title: 'Grafana Dashboards',
      url: 'https://grafana.example.com',
      description: 'System metrics, monitoring, and alerts.',
    },
    {
      title: 'Jenkins CI/CD',
      url: 'https://jenkins.example.com',
      description: 'Build pipelines and deployment jobs.',
    },
    {
      title: 'PagerDuty',
      url: 'https://pagerduty.example.com',
      description: 'On-call schedules and incident management.',
    },
    {
      title: 'AWS Console',
      url: 'https://aws.amazon.com/console/',
      description: 'Cloud infrastructure management.',
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#141414', minHeight: '100%', borderRadius: '8px' }}>
      <Title level={2} style={{ color: '#fff', marginBottom: 24 }}>Common Websites & Tools</Title>
      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={data}
        renderItem={(item) => (
          <List.Item>
            <Card 
              title={<a href={item.url} target="_blank" rel="noopener noreferrer"><LinkOutlined /> {item.title}</a>}
              style={{ background: '#1f1f1f', borderColor: '#303030' }}
            >
              <p style={{ color: '#ccc' }}>{item.description}</p>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default CommonWebsitesPage;
