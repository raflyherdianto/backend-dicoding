const { nanoid } = require("nanoid");
const books = require("./books");

const addBookHandler = (request, h) => {
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  const id = nanoid(16);

  // Check if the book is read fully
  const finished = pageCount === readPage;

  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };

  // Check if the client doesn't attach the book's name
  if (typeof name === "undefined") {
    const response = h.response({
      status: "fail",
      message: "Gagal menambahkan buku. Mohon isi nama buku",
    });
    response.code(400);
    return response;
  }

  // Check if readPage is bigger then pageCount (impossible)
  if (readPage > pageCount) {
    const response = h.response({
      status: "fail",
      message:
        "Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount",
    });
    response.code(400);
    return response;
  }

  books.push(newBook);

  const isSuccess = books.filter((book) => book.id === id).length > 0;

  // Check for successful addition
  if (isSuccess) {
    const response = h.response({
      status: "success",
      message: "Buku berhasil ditambahkan",
      data: {
        bookId: id,
      },
    });
    response.code(201);
    return response;
  }

  // Else, throw generic error
  const response = h.response({
    status: "error",
    message: "Buku gagal ditambahkan",
  });
  response.code(500);
  return response;
};

const getBooksHandler = (request, h) => {
  const { name, reading, finished } = request.query;

  // If the client asks for books based on name
  if (name) {
    // Hold the name
    const nameSearched = name.toLowerCase();
    // Filter the books
    const bookList = books
      .filter((book) => book.name.toLowerCase().includes(nameSearched))
      .map((book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      }));
    // Return the bookList as the desired data
    const response = h.response({
      status: "success",
      data: {
        books: bookList,
      },
    });
    response.code(200);
    return response;
  }

  // If the client asks for books based on reading status
  if (reading) {
    // Filter the books
    const bookList = books
      .filter((book) => book.reading === (reading === 1))
      .map((book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      }));
    // Return the bookList as the desired data
    const response = h.response({
      status: "success",
      data: {
        books: bookList,
      },
    });
    response.code(200);
    return response;
  }

  // If the client asks for books based on finished status
  if (finished) {
    // Filter the books
    const bookList = books
      .filter((book) => book.finished === (finished === 1))
      .map((book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      }));
    // Return the bookList as the desired data
    const response = h.response({
      status: "success",
      data: {
        books: bookList,
      },
    });
    response.code(200);
    return response;
  }

  // Else, assuming the client wants all books
  const response = h.response({
    status: "success",
    data: {
      books: books.map((book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      })),
    },
  });
  response.code(200);
  return response;
};

const getBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const book = books.filter((b) => b.id === bookId)[0];

  if (typeof book !== "undefined") {
    return {
      status: "success",
      data: {
        book,
      },
    };
  }
  const response = h.response({
    status: "fail",
    message: "Buku tidak ditemukan",
  });
  response.code(404);
  return response;
};

const editBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  const updatedAt = new Date().toISOString();

  // Check if the book is read fully
  const finished = pageCount === readPage;

  // Check if the client doesn't attach the book's name
  if (typeof name === "undefined") {
    const response = h.response({
      status: "fail",
      message: "Gagal memperbarui buku. Mohon isi nama buku",
    });
    response.code(400);
    return response;
  }

  // Check if readPage is bigger then pageCount (impossible)
  if (readPage > pageCount) {
    const response = h.response({
      status: "fail",
      message:
        "Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount",
    });
    response.code(400);
    return response;
  }

  const index = books.findIndex((book) => book.id === bookId);

  if (index !== -1) {
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      finished,
      reading,
      updatedAt,
    };
    const response = h.response({
      status: "success",
      message: "Buku berhasil diperbarui",
    });
    response.code(200);
    return response;
  }

  // If ID is not found, return error
  const response = h.response({
    status: "fail",
    message: "Gagal memperbarui buku. Id tidak ditemukan",
  });
  response.code(404);
  return response;
};

const deleteBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const index = books.findIndex((book) => book.id === bookId);

  if (index !== -1) {
    books.splice(index, 1);
    const response = h.response({
      status: "success",
      message: "Buku berhasil dihapus",
    });
    response.code(200);
    return response;
  }

  // If ID is not found, return error
  const response = h.response({
    status: "fail",
    message: "Buku gagal dihapus. Id tidak ditemukan",
  });
  response.code(404);
  return response;
};

module.exports = {
  addBookHandler,
  getBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};