let bookShelf = [];
const RENDER_EVENT = "render-book";
const STORAGE_KEY = "books";

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser Anda Tidak Mendukung Local Storage");
    return false;
  }
  return true;
}

const saveData = () => {
  if (isStorageExist()) {
    const dataParsed = JSON.stringify(bookShelf);
    localStorage.setItem(STORAGE_KEY, dataParsed);
  }
};

function loadDataFromStorage() {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (data !== null) {
    for (const book of data) {
      bookShelf.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function generateRandomId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

function findBook(bookId) {
  for (const bookItem of bookShelf) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in bookShelf) {
    if (bookShelf[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function addBook() {
  const title = document.getElementById("inputBookTitle").value;
  const author = document.getElementById("inputBookAuthor").value;
  const year = document.getElementById("inputBookYear").value;
  const isComplete = document.getElementById("inputBookIsComplete").checked;
  const id = generateRandomId();

  const book = generateBookObject(id, title, author, year, isComplete);
  bookShelf.push(book);
  saveData();

  // reset
  document.getElementById("inputBookTitle").value = null;
  document.getElementById("inputBookAuthor").value = null;
  document.getElementById("inputBookYear").value = null;
  document.getElementById("inputBookIsComplete").checked = false;

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function makeBook(book) {
  const title = document.createElement("h3");
  title.innerText = book.title;

  const author = document.createElement("p");
  author.innerText = book.author;

  const year = document.createElement("p");
  year.innerText = book.year;

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("action");

  const bookContainer = document.createElement("article");
  bookContainer.setAttribute("id", book.id);
  bookContainer.classList.add("book_item");
  if (book.isComplete) {
    buttonContainer.append(
      createCheckButton(book.id),
      createTrashButton(book.id)
    );
  } else {
    buttonContainer.append(
      createUndoButton(book.id),
      createTrashButton(book.id)
    );
  }
  bookContainer.append(title, author, year, buttonContainer);

  return bookContainer;
}

function createUndoButton(id) {
  const undoButton = document.createElement("button");
  undoButton.classList.add("undo-button");
  undoButton.innerHTML = "Selesai";
  undoButton.addEventListener("click", function () {
    const bookTarget = findBook(id);
    if (bookTarget == null) return;
    bookTarget.isComplete = true;
    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));
  });
  return undoButton;
}

// --
function createCheckButton(id) {
  const checkButton = document.createElement("button");
  checkButton.classList.add("check-button");
  checkButton.innerHTML = "Belum selesai";
  checkButton.addEventListener("click", function () {
    const bookTarget = findBook(id);
    if (bookTarget == null) return;
    bookTarget.isComplete = false;
    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));
  });
  return checkButton;
}

// --
function createTrashButton(id) {
  const trashButton = document.createElement("button");
  trashButton.classList.add("trash-button");
  trashButton.innerHTML = "Hapus";
  trashButton.addEventListener("click", function () {
    const bookTarget = findBook(id);
    if (bookTarget === -1) return;
    bookShelf.splice(bookTarget, 1);
    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));
  });
  return trashButton;
}

function searchBook() {
  const search_value = document.getElementById("searchBookTitle").value;
  const all_data = JSON.parse(localStorage.getItem(STORAGE_KEY));
  const find = [];
  for (const bookItem of all_data) {
    if (
      String(bookItem.title)
        .toLowerCase()
        .includes(String(search_value).toLowerCase())
    ) {
      find.push(bookItem);
    }
  }
  bookShelf = find;
  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener("DOMContentLoaded", function () {
  loadDataFromStorage();

  document
    .getElementById("bookSubmit")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      addBook();
    });
  document
    .getElementById("searchBookTitle")
    .addEventListener("keyup", function (event) {
      event.preventDefault();
      searchBook();
    });
});

document.addEventListener(RENDER_EVENT, function () {
  const unread = document.getElementById("incompleteBookshelfList");
  const finishRead = document.getElementById("completeBookshelfList");
  unread.innerHTML = "";
  finishRead.innerHTML = "";

  for (const bookItem of bookShelf) {
    const bookElement = makeBook(bookItem);
    if (bookItem.isComplete) {
      finishRead.append(bookElement);
    } else {
      unread.append(bookElement);
    }
  }
});
