'use client';

import React, { useState, useEffect } from 'react';
import { Card, Radio, Button, Typography, Space, Progress, Layout, Result, Collapse, Divider, InputNumber, Form, RadioChangeEvent, Select, Switch } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined, HomeOutlined, CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import Link from 'next/link';
import styles from './quiz.module.css';

const { Title, Paragraph, Text } = Typography;
const { Header, Content, Footer } = Layout;
const { Panel } = Collapse;
const { Option } = Select;

interface Question {
  id: number;
  question: string;
  options: string[];
  answer: string;
  type: string;
  scenario?: string;
  userAnswer?: string;
}

interface Exam {
  name: string;
  description: string;
}

interface VendorExams {
  provider: string;
  exams: Exam[];
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
  const [questionType, setQuestionType] = useState<string>('mixed');
  const [showAnswersImmediately, setShowAnswersImmediately] = useState<boolean>(false);
  const [answerSubmitted, setAnswerSubmitted] = useState<boolean>(false);
  
  // New state variables for vendor and exam selection
  const [examList, setExamList] = useState<VendorExams[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string>('');
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [availableExams, setAvailableExams] = useState<Exam[]>([]);

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

    async function fetchExamList() {
      try {
        const response = await fetch('/exam-list.json');
        const data = await response.json();
        setExamList(data);
      } catch (error) {
        console.error('Error fetching exam list:', error);
      }
    }

    fetchQuestions();
    fetchExamList();
  }, []);

  // Update available exams when vendor changes
  useEffect(() => {
    if (selectedVendor) {
      const vendorData = examList.find(v => v.provider === selectedVendor);
      if (vendorData) {
        setAvailableExams(vendorData.exams);
        setSelectedExam(''); // Reset exam selection when vendor changes
      } else {
        setAvailableExams([]);
      }
    } else {
      setAvailableExams([]);
    }
  }, [selectedVendor, examList]);

  const startQuiz = () => {
    // Filter questions based on selected type
    let filteredQuestions = [...allQuestions];
    if (questionType === 'regular') {
      filteredQuestions = allQuestions.filter(q => q.type !== 'scenario');
    } else if (questionType === 'scenario') {
      filteredQuestions = allQuestions.filter(q => q.type === 'scenario');
    }
    
    // Randomize questions and select requested number
    const shuffled = [...filteredQuestions].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, numQuestionsToAnswer);
    setQuestions(selectedQuestions);
    setQuizStarted(true);
  };

  // Handle vendor selection change
  const handleVendorChange = (value: string) => {
    setSelectedVendor(value);
  };

  // Handle exam selection change
  const handleExamChange = (value: string) => {
    setSelectedExam(value);
  };

  const handleOptionChange = (e: RadioChangeEvent) => {
    setSelectedOption(e.target.value);
    
    // Remove automatic submission when selecting an option
    // Only set answerSubmitted to true when Check Answer button is clicked
  };

  // Add new function to handle checking answers
  const handleCheckAnswer = () => {
    if (selectedOption) {
      setAnswerSubmitted(true);
    }
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
        setAnswerSubmitted(false); // Reset answer submission state for new question
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
              Configure your quiz settings below.
            </Paragraph>
            
            <Form layout="vertical">
              {/* Vendor Selection */}
              <Form.Item label="Select Vendor">
                <Select
                  placeholder="Select a vendor"
                  style={{ width: '100%' }}
                  onChange={handleVendorChange}
                  value={selectedVendor || undefined}
                >
                  {examList.map((vendor) => (
                    <Option key={vendor.provider} value={vendor.provider}>
                      {vendor.provider}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              
              {/* Exam Selection - only visible when vendor is selected */}
              {selectedVendor && (
                <Form.Item label="Select Exam">
                  <Select
                    placeholder="Select an exam"
                    style={{ width: '100%' }}
                    onChange={handleExamChange}
                    value={selectedExam || undefined}
                  >
                    {availableExams.map((exam) => (
                      <Option key={exam.name} value={exam.name}>
                        {exam.name}
                      </Option>
                    ))}
                  </Select>
                  {selectedExam && (
                    <div style={{ marginTop: '8px' }}>
                      <Text type="secondary">
                        {availableExams.find(e => e.name === selectedExam)?.description}
                      </Text>
                    </div>
                  )}
                </Form.Item>
              )}

              <Form.Item label="Question Type">
                <Select 
                  defaultValue="mixed"
                  style={{ width: '100%' }}
                  onChange={(value) => setQuestionType(value)}
                >
                  <Option value="mixed">Mixed (All Question Types)</Option>
                  <Option value="regular">Regular Questions</Option>
                  <Option value="scenario">Scenario-based Questions</Option>
                </Select>
              </Form.Item>
              
              <Form.Item 
                label={`Number of Questions (Maximum: ${
                  questionType === 'regular' 
                    ? allQuestions.filter(q => q.type !== 'scenario').length 
                    : questionType === 'scenario' 
                      ? allQuestions.filter(q => q.type === 'scenario').length 
                      : allQuestions.length
                })`}
              >
                <InputNumber 
                  min={1} 
                  max={
                    questionType === 'regular' 
                      ? allQuestions.filter(q => q.type !== 'scenario').length 
                      : questionType === 'scenario' 
                        ? allQuestions.filter(q => q.type === 'scenario').length 
                        : allQuestions.length
                  } 
                  defaultValue={numQuestionsToAnswer}
                  onChange={handleQuestionNumberChange}
                  style={{ width: '100%' }}
                />
              </Form.Item>
              
              <Form.Item label="Show Answers Immediately">
                <Switch 
                  checked={showAnswersImmediately} 
                  onChange={(checked) => setShowAnswersImmediately(checked)} 
                />
                <Text type="secondary" style={{ marginLeft: '10px' }}>
                  Show correct/wrong feedback after each selection
                </Text>
              </Form.Item>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  size="large" 
                  onClick={startQuiz}
                  disabled={
                    numQuestionsToAnswer <= 0 || 
                    (questionType === 'regular' && numQuestionsToAnswer > allQuestions.filter(q => q.type !== 'scenario').length) ||
                    (questionType === 'scenario' && numQuestionsToAnswer > allQuestions.filter(q => q.type === 'scenario').length) ||
                    (questionType === 'mixed' && numQuestionsToAnswer > allQuestions.length)
                  }
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
          
          {currentQuestion.scenario && (
            <Card type="inner" style={{ marginBottom: '16px', backgroundColor: '#f5f5f5' }}>
              <Title level={5} style={{ marginBottom: '8px' }}>Scenario:</Title>
              <Paragraph>{currentQuestion.scenario}</Paragraph>
            </Card>
          )}
          
          <Title level={4}>{currentQuestion.question}</Title>
          
          <Radio.Group 
            onChange={handleOptionChange} 
            value={selectedOption} 
            className={styles.radioGroup}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {currentQuestion.options.map((option, index) => (
                <div key={index} className={styles.radioOption}>
                  <Radio value={option}>
                    {option}
                    {showAnswersImmediately && answerSubmitted && (
                      <>
                        {option === currentQuestion.answer && (
                          <CheckCircleFilled style={{ color: 'green', marginLeft: '8px' }} />
                        )}
                        {selectedOption === option && option !== currentQuestion.answer && (
                          <CloseCircleFilled style={{ color: 'red', marginLeft: '8px' }} />
                        )}
                      </>
                    )}
                  </Radio>
                </div>
              ))}
            </Space>
          </Radio.Group>

          {showAnswersImmediately && answerSubmitted && selectedOption !== currentQuestion.answer && (
            <div style={{ margin: '16px 0', padding: '10px', backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '4px' }}>
              <Text strong style={{ color: 'green' }}>Correct answer: </Text>
              <Text>{currentQuestion.answer}</Text>
            </div>
          )}

          {/* Add Check Answer button when showAnswersImmediately is enabled */}
          {showAnswersImmediately && !answerSubmitted && (
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <Button
                type="primary"
                onClick={handleCheckAnswer}
                disabled={!selectedOption}
              >
                Check Answer
              </Button>
            </div>
          )}

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
              disabled={!selectedOption || (showAnswersImmediately && !answerSubmitted)}
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
