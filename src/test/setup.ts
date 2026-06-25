import "@testing-library/jest-dom";

// Mock IndexedDB for tests
const { IDBFactory } = require("fake-indexeddb");
global.indexedDB = new IDBFactory();
