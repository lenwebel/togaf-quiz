'use client';

import React, { useState, useEffect } from 'react';
import { Card, Radio, Button, Typography, Space, Progress, Layout, Result, Collapse, Divider, InputNumber, Form, RadioChangeEvent } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined, HomeOutlined } from '@ant-design/icons';
import Link from 'next/link';
import styles from './quiz.module.css';

const { Title, Paragraph, Text } = Typography;
const { Header, Content, Footer } = Layout;
const { Panel } = Collapse;

interface Question {
  id: number;
  question: string;
  options: string[];
  answer: string;
  type: string;
  userAnswer?: string;
}

export default function QuizPage() {
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [incorrectAnswers, setIncorrectAnswers] = useState<Question[]>([]);
  const [showIncorrectAnswers, setShowIncorrectAnswers] = useState(false);
  const [numQuestionsToAnswer, setNumQuestionsToAnswer] = useState<number>(10);
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await fetch('/questions.json');
        const data = await response.json();
        setAllQuestions(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching questions:', error);
        setLoading(false);
      }
    }

    fetchQuestions();
  }, []);

  const startQuiz = () => {
    // Randomize questions and select requested number
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, numQuestionsToAnswer);
    setQuestions(selectedQuestions);
    setQuizStarted(true);
  };

  const handleOptionChange = (e: RadioChangeEvent) => {
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
      } else {
        // Store incorrect answer
        const incorrectQuestion = {
          ...currentQuestion,
          userAnswer: selectedOption
        };
        setIncorrectAnswers(prev => [...prev, incorrectQuestion]);
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
    setIncorrectAnswers([]);
    setShowIncorrectAnswers(false);
    setQuizStarted(false);
  };

  const handleQuestionNumberChange = (value: number | null) => {
    if (value !== null) {
      setNumQuestionsToAnswer(value);
    }
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

  // Quiz configuration screen
  if (!quizStarted) {
    return (
      <Layout className={styles.layout}>
        <Header className={styles.header}>
          <Title level={2} style={{ color: 'white', margin: 0 }}>TOGAF Quiz Setup</Title>
        </Header>
        <Content className={styles.content}>
          <Card className={styles.card}>
            <Title level={3}>Quiz Setup</Title>
            <Paragraph>
              Select how many questions you would like to answer.
              (Maximum: {allQuestions.length})
            </Paragraph>
            
            <Form layout="vertical">
              <Form.Item label="Number of Questions">
                <InputNumber 
                  min={1} 
                  max={allQuestions.length} 
                  defaultValue={numQuestionsToAnswer}
                  onChange={handleQuestionNumberChange}
                  style={{ width: '100%' }}
                />
              </Form.Item>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  size="large" 
                  onClick={startQuiz}
                  disabled={numQuestionsToAnswer <= 0 || numQuestionsToAnswer > allQuestions.length}
                  style={{ width: '100%' }}
                >
                  Start Quiz
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Content>
        <Footer className={styles.footer}>
          TOGAF Quiz App ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    );
  }
  if (showResult) {
    return (
      <Layout className={styles.layout}>
        <Header className={styles.header}>
          <Title level={2} style={{ color: 'white', margin: 0, textAlign: 'center' }}>TOGAF Quiz Results</Title>
        </Header>
        <Content className={styles.content}>
          <Result
            status={score > questions.length / 2 ? "success" : "warning"}
            title={`Your score: ${score} / ${questions.length}`}
            subTitle={`You got ${Math.round((score / questions.length) * 100)}% of the questions correct`}
            extra={[
              <Button key="restart" type="primary" onClick={restartQuiz} style={{ width: '100%' }}>
                Restart Quiz
              </Button>,
              <Link href="/" key="home">
                <Button icon={<HomeOutlined />} style={{ width: '100%', marginTop: '8px' }}>Return Home</Button>
              </Link>
            ]}
          />
          
          {incorrectAnswers.length > 0 && (
            <Card className={styles.card} style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', marginBottom: '16px' }}>
                <Title level={4} style={{ margin: 0, textAlign: 'center' }}>
                  Incorrect Answers ({incorrectAnswers.length})
                </Title>
                <Button 
                  type="primary" 
                  onClick={() => setShowIncorrectAnswers(!showIncorrectAnswers)}
                  style={{ marginTop: '8px', width: '100%' }}
                >
                  {showIncorrectAnswers ? 'Hide Details' : 'Show Details'}
                </Button>
              </div>
              
              {showIncorrectAnswers && (
                <Collapse>
                  {incorrectAnswers.map((question, index) => (
                    <Panel 
                      header={`Question ${index + 1}: ${question.question}`} 
                      key={question.id.toString()}
                    >
                      <Paragraph>
                        <Text strong>Your answer: </Text>
                        <Text type="danger">{question.userAnswer}</Text>
                      </Paragraph>
                      <Paragraph>
                        <Text strong>Correct answer: </Text>
                        <Text type="success">{question.answer}</Text>
                      </Paragraph>
                      <Divider style={{ margin: '12px 0' }} />
                      <Paragraph>
                        <Text strong>All options:</Text>
                        <ul>
                          {question.options.map((option, i) => (
                            <li key={i} style={{ 
                              color: option === question.answer ? 'green' : 
                                option === question.userAnswer ? 'red' : 'inherit' 
                            }}>
                              {option}
                            </li>
                          ))}
                        </ul>
                      </Paragraph>
                    </Panel>
                  ))}
                </Collapse>
              )}
            </Card>
          )}
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
