// jest.config.js
module.exports = {
    preset: 'ts-jest', // Usa ts-jest para arquivos TypeScript
    testEnvironment: 'node', // Define o ambiente de teste como Node.js (para backend)
    testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'], // Padrão para encontrar arquivos de teste
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'], // Extensões que o Jest vai procurar
    roots: ['<rootDir>/src'], // Onde procurar pelos testes (geralmente dentro de src)
    clearMocks: true, // Limpa mocks automaticamente entre cada teste
    coverageDirectory: "coverage", // Pasta onde os relatórios de cobertura serão gerados (opcional)
  
    // Configuração opcional para mongodb-memory-server (se for usar)
    // Pode precisar criar um arquivo de setup global, veja a documentação do mongodb-memory-server
    // globalSetup: './test-setup/globalSetup.js',
    // globalTeardown: './test-setup/globalTeardown.js',
    // testEnvironment: './test-setup/mongoEnvironment.js',
  
    // Se você usa path aliases no tsconfig.json, pode precisar configurar moduleNameMapper aqui
    // moduleNameMapper: {
    //   '^@/(.*)$': '<rootDir>/src/$1',
    // },
  };