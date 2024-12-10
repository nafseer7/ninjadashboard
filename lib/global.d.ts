// lib/global.d.ts

declare global {
    namespace NodeJS {
      interface Global {
        mongo: { conn: any | null; promise: Promise<any> | null };
      }
    }
  }
  
  export {};
  