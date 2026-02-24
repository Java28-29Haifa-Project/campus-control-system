
module.exports = {
    testEnvironment: "jsdom",
    transform: {
        "^.+\\.(ts|tsx|js|jsx)$": "babel-jest",
    },
    transformIgnorePatterns: [
        "/node_modules/(?!(react-router|react-router-dom)/)"
    ],
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
    moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
    moduleNameMapper: {
        "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    },
    testMatch: ["<rootDir>/src/**/*.test.(ts|tsx|js|jsx)"],
};