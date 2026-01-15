
import { Idea, IdeaStatus, CompanyQuestion, QuestionAnswer, AdminUser } from '../types';

const IDEAS_KEY = 'isip_enterprise_ideas';
const QUESTIONS_KEY = 'isip_company_questions';
const ANSWERS_KEY = 'isip_question_answers';
const USERS_KEY = 'isip_admin_users';

export const storageService = {
  // Ideas
  getIdeas: (): Idea[] => {
    const data = localStorage.getItem(IDEAS_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  saveIdea: (idea: Idea) => {
    const ideas = storageService.getIdeas();
    ideas.unshift(idea);
    localStorage.setItem(IDEAS_KEY, JSON.stringify(ideas));
  },
  
  updateIdea: (updatedIdea: Idea) => {
    const ideas = storageService.getIdeas();
    const index = ideas.findIndex(i => i.id === updatedIdea.id);
    if (index !== -1) {
      ideas[index] = { ...updatedIdea, lastUpdated: new Date().toISOString() };
      localStorage.setItem(IDEAS_KEY, JSON.stringify(ideas));
    }
  },
  
  deleteIdea: (id: string) => {
    const ideas = storageService.getIdeas();
    const filtered = ideas.filter(i => i.id !== id);
    localStorage.setItem(IDEAS_KEY, JSON.stringify(filtered));
  },

  // Users
  getUsers: (): AdminUser[] => {
    const data = localStorage.getItem(USERS_KEY);
    if (!data) {
      // Seed default admin
      const defaultAdmin: AdminUser = {
        id: '1',
        username: 'admin',
        password: 'TIM',
        name: 'Super Admin',
        role: 'System Architect',
        lastLogin: new Date().toISOString()
      };
      localStorage.setItem(USERS_KEY, JSON.stringify([defaultAdmin]));
      return [defaultAdmin];
    }
    return JSON.parse(data);
  },

  saveUser: (user: AdminUser) => {
    const users = storageService.getUsers();
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  updateUser: (updatedUser: AdminUser) => {
    const users = storageService.getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  },

  deleteUser: (id: string) => {
    const users = storageService.getUsers();
    const filtered = users.filter(u => u.id !== id);
    localStorage.setItem(USERS_KEY, JSON.stringify(filtered));
  },

  updateUserLogin: (username: string) => {
    const users = storageService.getUsers();
    const index = users.findIndex(u => u.username === username);
    if (index !== -1) {
      users[index].lastLogin = new Date().toISOString();
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  },

  // Analytics Helpers
  getStats: () => {
    const ideas = storageService.getIdeas();
    return {
      total: ideas.length,
      byStatus: {
        Review: ideas.filter(i => i.status === 'Review').length,
        Pilot: ideas.filter(i => i.status === 'Pilot').length,
        Implemented: ideas.filter(i => i.status === 'Implemented').length,
        Deferred: ideas.filter(i => i.status === 'Deferred').length,
      },
      topDepartments: Array.from(new Set(ideas.map(i => i.department)))
        .map(dept => ({
          name: dept,
          count: ideas.filter(i => i.department === dept).length
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    };
  },

  // Legacy/Pulse Compatibility
  getQuestions: (): CompanyQuestion[] => {
    const data = localStorage.getItem(QUESTIONS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveQuestion: (question: CompanyQuestion) => {
    const questions = storageService.getQuestions();
    questions.unshift(question);
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
  },
  getAnswers: (): QuestionAnswer[] => {
    const data = localStorage.getItem(ANSWERS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveAnswer: (answer: QuestionAnswer) => {
    const answers = storageService.getAnswers();
    answers.unshift(answer);
    localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
  },
  getAnswersForQuestion: (questionId: string): QuestionAnswer[] => {
    return storageService.getAnswers().filter(a => a.questionId === questionId);
  }
};
