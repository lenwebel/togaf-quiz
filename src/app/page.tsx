'use client';

import React, { useState, useEffect } from 'react';
import { Card, Radio, Button, Typography, Space, Progress, Layout, Result } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined,  HomeOutlined } from '@ant-design/icons';
import Link from 'next/link';
import styles from './quiz.module.css';

const { Title, Paragraph, Text } = Typography;
const { Header, Content, Footer } = Layout;

interface Question {
  id: number;
  question: string;
  options: string[];
  answer: string;
  type: string;
}

export default function QuizPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await fetch('/questions.json');
        const data = await response.json();
        setQuestions(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching questions:', error);
        setLoading(false);
      }
    }

    fetchQuestions();
  }, []);

  const handleOptionChange = (e: any) => {
    setSelectedOption(e.target.value);
  };

  const handleNext = () => {
    if (selectedOption) {
      const currentQuestion = questions[currentQuestionIndex];
      
      // Save user's answer
      setUserAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: selectedOption
      }));
      
      // Check if answer is correct
      if (selectedOption === currentQuestion.answer) {
        setScore(prevScore => prevScore + 1);
      }
      
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        setSelectedOption(null);
      } else {
        setShowResult(true);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
      // Restore previous answer if it exists
      const prevQuestionId = questions[currentQuestionIndex - 1].id;
      setSelectedOption(userAnswers[prevQuestionId] || null);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setScore(0);
    setShowResult(false);
    setUserAnswers({});
  };

  if (loading) {
    return (
      <Layout className={styles.layout}>
        <Content className={styles.content}>
          <Card>
            <Paragraph>Loading questions...</Paragraph>
          </Card>
        </Content>
      </Layout>
    );
  }

  if (showResult) {
    return (
      <Layout className={styles.layout}>
        <Header className={styles.header}>
          <Title level={2} style={{ color: 'white', margin: 0 }}>TOGAF Quiz Results</Title>
        </Header>
        <Content className={styles.content}>
          <Result
            status={score > questions.length / 2 ? "success" : "warning"}
            title={`Your score: ${score} / ${questions.length}`}
            subTitle={`You got ${Math.round((score / questions.length) * 100)}% of the questions correct`}
            extra={[
              <Button key="restart" type="primary" onClick={restartQuiz}>
                Restart Quiz
              </Button>,
              <Link href="/" key="home">
                <Button icon={<HomeOutlined />}>Return Home</Button>
              </Link>
            ]}
          />
        </Content>
        <Footer className={styles.footer}>
          TOGAF Quiz App ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Layout className={styles.layout}>
      <Header className={styles.header}>
        <Title level={2} style={{ color: 'white', margin: 0 }}>TOGAF Quiz</Title>
      </Header>
      <Content className={styles.content}>
        <Card className={styles.card}>
          <Progress 
            percent={Math.round(((currentQuestionIndex + 1) / questions.length) * 100)} 
            status="active" 
            showInfo={false} 
            className={styles.progress}
          />
          <Text type="secondary">Question {currentQuestionIndex + 1} of {questions.length}</Text>
          
          <Title level={4}>{currentQuestion.question}</Title>
          
          <Radio.Group 
            onChange={handleOptionChange} 
            value={selectedOption} 
            className={styles.radioGroup}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {currentQuestion.options.map((option, index) => (
                <Radio key={index} value={option} className={styles.radioOption}>
                  {option}
                </Radio>
              ))}
            </Space>
          </Radio.Group>

          <div className={styles.buttonContainer}>
            <Button 
              onClick={handlePrevious} 
              disabled={currentQuestionIndex === 0}
              icon={<ArrowLeftOutlined />}
            >
              Previous
            </Button>
            <Button 
              type="primary" 
              onClick={handleNext} 
              disabled={!selectedOption}
              icon={<ArrowRightOutlined />}
            >
              {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </div>
        </Card>
      </Content>
      <Footer className={styles.footer}>
        TOGAF Quiz App ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
}
