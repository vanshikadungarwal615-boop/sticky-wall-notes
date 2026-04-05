let notes = JSON.parse(localStorage.getItem("notes")) || [];

const colors = ["#FFEB3B", "#FFCDD2", "#C8E6C9", "#BBDEFB", "#E1BEE7"];

// Save notes
function saveNotes() {
    localStorage.setItem("notes", JSON.stringify(notes));
}

// Render notes
function renderNotes() {
    const container = document.getElementById("notesContainer");
    container.innerHTML = "";

    notes.forEach((note, index) => {
        const div = document.createElement("div");
        div.className = "note";
        div.style.background = note.color;
        div.draggable = true;

        div.innerHTML = `
            <span class="pin" onclick="pinNote(${index})">📌</span>
            <span class="delete" onclick="deleteNote(${index})">❌</span>
            <p>${note.text}</p>
            <div class="timestamp">${note.time}</div>
        `;

        // Edit note (double click)
        div.addEventListener("dblclick", () => {
            const newText = prompt("Edit your note:", note.text);

            if (newText !== null && newText.trim() !== "") {
                notes[index].text = newText.trim();
                notes[index].time = new Date().toLocaleString();
                saveNotes();
                renderNotes();
            }
        });

        // Drag start
        div.addEventListener("dragstart", () => {
            div.classList.add("dragging");
        });

        // Drag end (save order)
        div.addEventListener("dragend", () => {
            div.classList.remove("dragging");

            const newNotes = [];
            document.querySelectorAll(".note").forEach(noteDiv => {
                const text = noteDiv.querySelector("p").innerText;
                const found = notes.find(n => n.text === text);
                newNotes.push(found);
            });

            notes = newNotes;
            saveNotes();
        });

        container.appendChild(div);
    });
}

// Add note
function addNote() {
    const input = document.getElementById("noteInput");
    const text = input.value.trim();

    if (text === "") {
        alert("Note cannot be empty!");
        return;
    }

    if (notes.length >= 20) {
        alert("Maximum 20 notes allowed!");
        return;
    }

    const newNote = {
        text: text,
        color: colors[Math.floor(Math.random() * colors.length)],
        time: new Date().toLocaleString()
    };

    notes.push(newNote);
    saveNotes();
    renderNotes();

    input.value = "";
}

// Delete note
function deleteNote(index) {
    notes.splice(index, 1);
    saveNotes();
    renderNotes();
}

// Pin note
function pinNote(index) {
    const note = notes.splice(index, 1)[0];
    notes.unshift(note);
    saveNotes();
    renderNotes();
}

// Drag container logic
const container = document.getElementById("notesContainer");

container.addEventListener("dragover", (e) => {
    e.preventDefault();
    const dragging = document.querySelector(".dragging");
    const afterElement = getDragAfterElement(container, e.clientY);

    if (afterElement == null) {
        container.appendChild(dragging);
    } else {
        container.insertBefore(dragging, afterElement);
    }
});

function getDragAfterElement(container, y) {
    const elements = [...container.querySelectorAll(".note:not(.dragging)")];

    return elements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Search notes
function searchNotes() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const allNotes = document.querySelectorAll(".note");

    allNotes.forEach(note => {
        const text = note.innerText.toLowerCase();
        note.style.display = text.includes(query) ? "block" : "none";
    });
}

// Dark mode
function toggleDarkMode() {
    document.body.classList.toggle("dark");
    localStorage.setItem("darkMode", document.body.classList.contains("dark"));
}

// Load dark mode
if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
}

// Initial render
renderNotes();