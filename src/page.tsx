'use client';

import React from 'react';
import { Button, Typography, Card, Space, Layout } from 'antd';
import Link from 'next/link';
import styles from './page.module.css';

const { Title, Paragraph } = Typography;
const { Header, Content, Footer } = Layout;

export default function Home() {
  return (
    <Layout className={styles.layout}>
      <Header className={styles.header}>
        <Title level={2} style={{ color: 'white', margin: 0 }}>TOGAF Quiz App</Title>
      </Header>
      <Content className={styles.content}>
        <Card className={styles.card}>
          <Title level={3}>Welcome to the TOGAF Quiz</Title>
          <Paragraph>
            Test your knowledge of The Open Group Architecture Framework (TOGAF) with 
            this interactive quiz application. The quiz contains questions covering 
            various aspects of TOGAF.
          </Paragraph>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Link href="/quiz">
              <Button type="primary" size="large" block>
                Start Quiz
              </Button>
            </Link>
          </Space>
        </Card>
      </Content>
      <Footer className={styles.footer}>
        TOGAF Quiz App ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
}
