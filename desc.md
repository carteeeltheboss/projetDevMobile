# Technical Summary: MyStudyCompanion

This document provides a technical overview of the "MyStudyCompanion" mobile application based on a codebase analysis.

## 1. Project Overview

The application is a productivity tool for students, designed to be a digital assistant. Its primary goal is to help users manage their academic life by providing features such as a Pomodoro timer, to-do lists (both personal and shared), a schedule viewer, and an alerts/notifications system. It is built with an offline-first approach, ensuring functionality even without a network connection by caching data locally.

## 2. Architecture Check

The project's folder structure meets the required standard. The analysis confirms the presence of the following directories:
- `src/components`: For reusable UI components.
- `src/screens`: For top-level screen components.
- `src/services`: For data fetching and other services.
- `assets`: Located in the root directory for static assets like icons.

## 3. Screens

The application contains **6 main screens**, which satisfies the requirement of having at least 3-5 distinct screens. The screens are:
- `DashboardScreen`: The main entry point and navigation hub.
- `PomodoroScreen`: A timer to help with focused work sessions.
- `TodoScreen`: A personal to-do list manager.
- `SharedTodoScreen`: A to-do list that is likely synchronized with an external source.
- `ScheduleScreen`: Displays the user's schedule.
- `AlertsScreen`: Shows important alerts and notifications.

## 4. Tech Stack

- **Framework:** The `package.json` file confirms the project is built with **"expo"** and **"react-native"**.
- **Navigation:** The application uses **React Navigation** with a **Stack Navigator** (`@react-navigation/native-stack`) to manage the flow between screens.
- **State Management:** State is managed locally within components using React's native hooks, primarily `useState` and `useEffect`. A custom hook, `useCachedResource`, is implemented to standardize the handling of asynchronous data (loading, data, error states) across the application, but no global state management library (like Redux or Zustand) is used.

## 5. Data Integration

- **API Connection:** Yes, there is evidence of an API connection. The file `src/services/googleSheetsService.js` uses the `fetch` API to retrieve data from a public Google Sheet, which serves as a simple, headless CMS for the app's schedule and alert data.
- **Database/Local Storage:** Yes, the application uses **`@react-native-async-storage/async-storage`** to cache the data fetched from the network. This enables the app's offline-first capabilities, allowing users to access their information without an active internet connection.

## 6. Documentation

Yes, a **`README.md`** file is present in the root directory of the project.
