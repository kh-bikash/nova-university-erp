-- Library Books table
CREATE TABLE IF NOT EXISTS library_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  isbn VARCHAR(50) UNIQUE,
  category VARCHAR(100),
  total_copies INT NOT NULL DEFAULT 1,
  available_copies INT NOT NULL DEFAULT 1,
  location VARCHAR(100), -- Shelf location
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Library Transactions table (Issues/Returns)
CREATE TABLE IF NOT EXISTS library_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES library_books(id),
  student_id UUID NOT NULL REFERENCES students(id),
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  return_date DATE,
  status VARCHAR(50) DEFAULT 'issued', -- issued, returned, overdue
  fine_amount DECIMAL(10, 2) DEFAULT 0,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_library_books_title ON library_books(title);
CREATE INDEX IF NOT EXISTS idx_library_books_author ON library_books(author);
CREATE INDEX IF NOT EXISTS idx_library_transactions_student_id ON library_transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_library_transactions_book_id ON library_transactions(book_id);
CREATE INDEX IF NOT EXISTS idx_library_transactions_status ON library_transactions(status);
