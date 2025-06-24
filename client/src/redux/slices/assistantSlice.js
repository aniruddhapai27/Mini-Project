import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  conversation: [],
  history: [],
  currentSessionId: null,
  isLoading: false,
  error: null,
};

export const streamAssistantMessage = createAsyncThunk(
  "assistant/streamMessage",
  async ({ message, sessionId }, { dispatch, rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      let url = "/api/v1/assistant/chat";
      if (sessionId) {
        url = `/api/v1/assistant/chat/${sessionId}`;
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || "Streaming request failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let newSessionId = sessionId;

      const createdSessionId = response.headers.get("X-Session-Id");
      if (createdSessionId && !sessionId) {
        newSessionId = createdSessionId;
        dispatch(setCurrentSessionId(newSessionId));
      }

      dispatch(addBotMessage({ message: "", sessionId: newSessionId }));

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const chunk = decoder.decode(value, { stream: !done });
        if (chunk) {
          const words = chunk.split(/(\s+)/);
          for (const word of words) {
            if (word) {
              dispatch(updateLastBotMessage({ chunk: word, sessionId: newSessionId }));
              await new Promise((resolve) => setTimeout(resolve, 50));
            }
          }
        }
      }

      return { success: true, sessionId: newSessionId };
    } catch (error) {
      const errorMessage = error.message || "Failed to stream message";
      dispatch(
        updateLastBotMessage({
          chunk: `\n\nSorry, an error occurred: ${errorMessage}`,
        })
      );
      return rejectWithValue(errorMessage);
    }
  }
);

const assistantSlice = createSlice({
  name: "assistant",
  initialState,
  reducers: {
    addUserMessage: (state, action) => {
      state.conversation.push({
        type: "user",
        message: action.payload.message,
        timestamp: new Date().toISOString(),
      });
    },
    addBotMessage: (state, action) => {
      state.conversation.push({
        type: "assistant",
        message: action.payload.message,
        timestamp: new Date().toISOString(),
      });
    },
    updateLastBotMessage: (state, action) => {
      const lastMessage = state.conversation[state.conversation.length - 1];
      if (lastMessage && lastMessage.type === "assistant") {
        lastMessage.message += action.payload.chunk;
      }
    },
    setCurrentSessionId: (state, action) => {
      state.currentSessionId = action.payload;
    },
    setConversation: (state, action) => {
      state.conversation = action.payload;
    },
    setHistory: (state, action) => {
      state.history = action.payload;
    },
     clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(streamAssistantMessage.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
        state.conversation.push({
          type: "user",
          message: action.meta.arg.message,
          timestamp: new Date().toISOString(),
        });
      })
      .addCase(streamAssistantMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.sessionId && !state.currentSessionId) {
          state.currentSessionId = action.payload.sessionId;
        }
      })
      .addCase(streamAssistantMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  addUserMessage,
  addBotMessage,
  updateLastBotMessage,
  setCurrentSessionId,
  setConversation,
  setHistory,
  clearError,
} = assistantSlice.actions;

export const selectAssistantConversation = (state) =>
  state.assistant.conversation;
export const selectAssistantIsLoading = (state) => state.assistant.isLoading;
export const selectAssistantError = (state) => state.assistant.error;
export const selectAssistantSessionId = (state) =>
  state.assistant.currentSessionId;
export const selectAssistantHistory = (state) => state.assistant.history;

export default assistantSlice.reducer;
