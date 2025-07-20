const { Pool } = require('pg');

// For local testing - create an in-memory mock
const mockDB = {
  customer: [],
  vehicles: [], 
  employee: [],
  service: [],
  inventory: [],
  billing: [],
  branches: []
};

let nextId = 1;

const mockPool = {
  query: async (text, params = []) => {
    console.log('Mock DB Query:', text, params);
    
    // Handle INSERT operations
    if (text.includes('INSERT INTO')) {
      const tableMatch = text.match(/INSERT INTO (\w+)/);
      const table = tableMatch ? tableMatch[1] : '';
      
      if (mockDB[table]) {
        const columnsMatch = text.match(/\(([^)]+)\)/);
        const columns = columnsMatch ? columnsMatch[1].split(',').map(c => c.trim()) : [];
        
        const newRecord = {};
        columns.forEach((col, index) => {
          newRecord[col] = params[index];
        });
        
        // Add an ID if not provided
        const idField = getIdField(table);
        if (!newRecord[idField]) {
          newRecord[idField] = nextId++;
        }
        
        mockDB[table].push(newRecord);
        return { rows: [newRecord] };
      }
    }
    
    // Handle SELECT operations
    if (text.includes('SELECT * FROM')) {
      const tableMatch = text.match(/SELECT \* FROM (\w+)/);
      const table = tableMatch ? tableMatch[1] : '';
      
      if (mockDB[table]) {
        return { rows: mockDB[table] };
      }
    }
    
    // Handle DELETE operations
    if (text.includes('DELETE FROM')) {
      const tableMatch = text.match(/DELETE FROM (\w+)/);
      const table = tableMatch ? tableMatch[1] : '';
      const whereMatch = text.match(/WHERE (\w+) = \$1/);
      const whereField = whereMatch ? whereMatch[1] : '';
      
      if (mockDB[table] && whereField && params[0]) {
        const initialLength = mockDB[table].length;
        mockDB[table] = mockDB[table].filter(record => record[whereField] != params[0]);
        const deletedCount = initialLength - mockDB[table].length;
        return { rowCount: deletedCount };
      }
    }
    
    // Handle UPDATE operations
    if (text.includes('UPDATE')) {
      const tableMatch = text.match(/UPDATE (\w+)/);
      const table = tableMatch ? tableMatch[1] : '';
      
      if (mockDB[table]) {
        const setMatch = text.match(/SET (.+) WHERE/);
        const whereMatch = text.match(/WHERE (\w+) = \$(\d+)/);
        
        if (setMatch && whereMatch) {
          const whereField = whereMatch[1];
          const whereParamIndex = parseInt(whereMatch[2]) - 1;
          const whereValue = params[whereParamIndex];
          
          const recordIndex = mockDB[table].findIndex(record => record[whereField] == whereValue);
          if (recordIndex !== -1) {
            const setParts = setMatch[1].split(',');
            let paramIndex = 0;
            
            setParts.forEach(part => {
              const [field] = part.trim().split('=');
              const cleanField = field.trim();
              if (paramIndex < params.length - 1) {
                mockDB[table][recordIndex][cleanField] = params[paramIndex];
                paramIndex++;
              }
            });
            
            return { rowCount: 1 };
          }
        }
      }
    }
    
    return { rows: [] };
  }
};

function getIdField(table) {
  const idMap = {
    customer: "customer_id",
    vehicles: "vehicle_id", 
    employee: "emp_id",
    service: "service_id",
    inventory: "inventory_id",
    branches: "branch_id",
    billing: "bill_id"
  };
  return idMap[table] || "id";
}

// Use mock for local development, real pool for production
const usePool = process.env.DATABASE_URL ? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
}) : mockPool;

module.exports = usePool;
