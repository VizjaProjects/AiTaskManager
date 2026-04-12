import { api } from "./client";
import type { Survey, Question, QuestionOption, QuestionType } from "../types";

interface RawSurvey {
  id: { value: string };
  title: string;
  description: string;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

function mapSurvey(raw: RawSurvey): Survey {
  return {
    surveyId: raw.id.value,
    title: raw.title,
    description: raw.description,
    isVisible: raw.visible,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export const surveyApi = {
  getAll: async () => {
    const { data } = await api.get<{ surveys: RawSurvey[] }>("/survey/all");
    return { surveys: data.surveys.map(mapSurvey) };
  },

  getAllActive: async () => {
    const { data } = await api.get<{ surveys: RawSurvey[] }>(
      "/survey/allAcrive",
    );
    return { surveys: data.surveys.map(mapSurvey) };
  },

  create: (body: { title: string; description: string }) =>
    api.post<{ surveyId: string; createdAt: string }>(
      "/survey/createSurvey",
      body,
    ),

  edit: (surveyId: string, body: { title: string; description: string }) =>
    api.put(`/survey/edit/${encodeURIComponent(surveyId)}`, body),

  changeVisibility: (surveyId: string, isVisible: boolean) =>
    api.patch(`/survey/changeVisible/${encodeURIComponent(surveyId)}`, {
      isVisible,
    }),

  delete: (surveyId: string) =>
    api.delete(`/survey/delete/${encodeURIComponent(surveyId)}`),
};

export const questionApi = {
  getAllForSurvey: (surveyId: string) =>
    api.get<
      Array<{
        questionId: string;
        questionText: string;
        questionType: QuestionType;
        hint: string | null;
      }>
    >(`/question/allSurveyQuestion/${encodeURIComponent(surveyId)}`),

  getOptions: (questionId: string) =>
    api.get<Array<{ questionOptionId: string; optionText: string }>>(
      `/question/questionOptions/${encodeURIComponent(questionId)}`,
    ),

  create: (
    surveyId: string,
    body: {
      questionText: string;
      questionType: QuestionType;
      optionTextValue: string[];
      isRequired: boolean;
      hint?: string | null;
    },
  ) =>
    api.post<{ questionId: string; surveyId: string; createdAt: string }>(
      `/question/${encodeURIComponent(surveyId)}`,
      body,
    ),

  edit: (
    questionId: string,
    body: {
      questionText: string;
      questionType: QuestionType;
      isRequired: boolean;
      hint?: string | null;
    },
  ) => api.put(`/question/edit/${encodeURIComponent(questionId)}`, body),

  delete: (questionId: string) =>
    api.patch(`/question/deleteQuestion/${encodeURIComponent(questionId)}`),
};

export const questionOptionApi = {
  edit: (questionOptionId: string, optionText: string) =>
    api.put(`/questionOption/edit/${encodeURIComponent(questionOptionId)}`, {
      optionText,
    }),

  delete: (questionOptionId: string) =>
    api.patch(`/questionOption/delete/${encodeURIComponent(questionOptionId)}`),
};

export interface UserResponseResultItem {
  surveyId: string;
  surveyDescription: string;
  questionId: string;
  questionText: string;
  userResponseId: string;
  textAnswer: string;
}

export const userResponseApi = {
  getAll: () =>
    api.get<{ userResponseResultSet: UserResponseResultItem[] }>(
      "/user-response/getAllUserResponse",
    ),

  submit: (surveyId: string, body: { questionId: string; answer: string }) =>
    api.post(`/user-response/${encodeURIComponent(surveyId)}`, body),

  edit: (userResponseId: string, newAnswer: string) =>
    api.put(`/user-response/change/${encodeURIComponent(userResponseId)}`, {
      newAnswer,
    }),
};
