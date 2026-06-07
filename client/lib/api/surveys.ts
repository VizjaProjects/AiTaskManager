import { api } from "./client";
import { mapQuestionDto, mapSurveyDto, normalizeArray } from "./adapters";
import type { QuestionType } from "../types";

export const surveyApi = {
  getAll: async () => {
    const { data } = await api.get("/survey/all");
    const surveys = normalizeArray(data, mapSurveyDto);
    return { surveys };
  },

  getAllActive: async () => {
    const { data } = await api.get("/survey/allAcrive");
    const surveys = normalizeArray(data, mapSurveyDto);
    return { surveys };
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
  getAllForSurvey: async (surveyId: string) => {
    const { data } = await api.get(
      `/question/allSurveyQuestion/${encodeURIComponent(surveyId)}`,
    );
    return normalizeArray(data, mapQuestionDto);
  },

  getOptions: async (questionId: string) => {
    const { data } = await api.get(
      `/question/questionOptions/${encodeURIComponent(questionId)}`,
    );
    const options = normalizeArray(data, (raw) => ({
      questionOptionId: raw.questionOptionId as string,
      optionText: raw.optionText as string,
    }));
    return options;
  },

  create: (
    surveyId: string,
    body: {
      questionText: string;
      questionType?: QuestionType;
      optionTextValue?: string[];
      isRequired: boolean;
      hint?: string | null;
    },
  ) =>
    api.post<{ questionId: string; surveyId: string; createdAt: string }>(
      `/question/${encodeURIComponent(surveyId)}`,
      {
        questionText: body.questionText,
        questionType: body.questionType ?? "TEXT",
        optionTextValue: body.optionTextValue ?? [],
        isRequired: body.isRequired,
        hint: body.hint ?? "",
      },
    ),

  edit: (
    questionId: string,
    body: {
      questionText: string;
      questionType?: QuestionType;
      isRequired: boolean;
      hint?: string | null;
    },
  ) =>
    api.put(`/question/edit/${encodeURIComponent(questionId)}`, {
      questionText: body.questionText,
      isRequired: body.isRequired,
      hint: body.hint ?? "",
    }),

  delete: (questionId: string) =>
    api.patch(`/question/deleteQuestion/${encodeURIComponent(questionId)}`),
};

/** In Progress — question options not in .NET */
export const questionOptionApi = {
  edit: async (_questionOptionId: string, _optionText: string) => {
    throw new Error("Question options are not available yet");
  },
  delete: async (_questionOptionId: string) => {
    throw new Error("Question options are not available yet");
  },
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

  getBySurvey: async (surveyId: string) => {
    const { data } = await api.get<{
      userResponseResultSet: UserResponseResultItem[];
    }>(`/user-response/survey/${encodeURIComponent(surveyId)}`);
    return data.userResponseResultSet ?? [];
  },

  submit: async (
    surveyId: string,
    body: { questionId: string; answer: string },
  ) => {
    const { data } = await api.post<{
      userResponseId: string;
      questionId: string;
      surveyId: string;
      answer: string;
    }>(`/user-response/${encodeURIComponent(surveyId)}`, body);
    return data;
  },

  edit: (userResponseId: string, newAnswer: string) =>
    api.put(`/user-response/change/${encodeURIComponent(userResponseId)}`, {
      newAnswer,
    }),

  delete: (userResponseId: string) =>
    api.delete(
      `/user-response/delete/${encodeURIComponent(userResponseId)}`,
    ),
};
