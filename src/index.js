'use strict'

let habits = [];
const HABIT_KEY = 'HABIT_KEY'

const page = {
    menu: document.querySelector('.menu'),
    header: {
        h: document.querySelector('.name'),
        prog_days: document.querySelector('.prog_days'),
        delHabit: document.querySelector('.delHabit_but')
    },
    content: {
        days_box: document.querySelector('#days_box'),
        next_day: document.querySelector('.day_next')
    }
}

function loadData() {
    const habitString = localStorage.getItem(HABIT_KEY);
    const habitArr = JSON.parse(habitString);
    if (Array.isArray(habitArr)) {
        habits = habitArr;
    }
}

function saveData() {
    localStorage.setItem(HABIT_KEY, JSON.stringify(habits))
}

function rerenderMenu(activeHabit) {
    page.menu.innerHTML = '';
    for(const habit of habits) {
        const el = document.createElement('button');
        el.setAttribute('habit_id', habit.id);
        el.classList.add('menu_but');
        el.classList.add('habit_but');
        el.addEventListener('click', () => rerender(habit.id));
        el.innerHTML = '<img src="./static/img/Star.svg" alt="">';

        if(activeHabit.id === habit.id){
            el.classList.add('menu_but_active');
        }
        
        page.menu.appendChild(el);
    }
}

function renderHead(activeHabit) {
    page.header.h.innerText = activeHabit.name;
    page.header.delHabit.setAttribute('habit_id', activeHabit.id);
    if(activeHabit.days.length < activeHabit.target) {
        page.header.prog_days.innerText = `${activeHabit.days.length} из ${activeHabit.target}`;    
    } else {
        page.header.prog_days.innerText = `Цель достигнута!`;
    }
    
}

function rerenderDays(activeHabit) {
    page.content.days_box.innerHTML = '';

    for(const day in activeHabit.days){
        const el = document.createElement('div');
        el.classList.add('day');
        el.innerHTML = `<div class="day_h">
                    <h3>День ${Number(day) + 1}</h3>
                    <button class="del_but" onclick="delDay(${activeHabit.id}, ${day})">
                        <img src="./static/img/delete.svg" alt="">
                    </button>
                </div>
                <hr>
                <div class="day_comm">
                    ${activeHabit.days[day].comment}
                </div>`;
        
        page.content.days_box.appendChild(el);
    }
    
    if(activeHabit.days.length < activeHabit.target) {
        const el = document.createElement('div');
        el.classList.add('day', 'last_day');
        el.innerHTML = `<div class="day_h">
                        <h3 class="next_day">День ${activeHabit.days.length + 1}</h3>
                    </div>
                    <hr>
                    <form class="day_comm" onsubmit="addDays(event)" data-habit-id="${activeHabit.id}">
                        <textarea name="comment" class="comm" placeholder="..." maxlength="250"></textarea>
                        <button id="add_day">Добавить день</button>
                    </form>`;
        
        page.content.days_box.appendChild(el);
    }
}

function rerender(activeHabitId) {
    const activeHabit = habits.find(habit => habit.id === activeHabitId);
    if(!activeHabit) return;

    rerenderMenu(activeHabit);
    renderHead(activeHabit);
    rerenderDays(activeHabit);
}

function addDays(event)  {
    event.preventDefault();
    const form = event.target;

    const data = new FormData(form);
    const comment = data.get('comment');
    
    form['comment'].classList.remove('empty');
    if(!comment){
        form['comment'].classList.add('empty');
    }

    habits = habits.map(habit => {
        if(habit.id == form.dataset.habitId){
            return {
                ...habit,
                days: habit.days.concat([{ comment }])
            }
        }
        return habit;
    });
    form['comment'].value = '';

    rerender(Number(form.dataset.habitId));
    saveData();
}

function delDay(activeHabitId, commIndex) {
    habits = habits.map(habit => {
        if(habit.id === activeHabitId){
            habit.days.splice(commIndex, 1);
        }
        return habit;
    })

    rerender(activeHabitId);
    saveData();
}

function showAdding() {
    document.querySelector('.cover').classList.remove('closed');
}
function closeAdding() {
    document.querySelector('.cover').classList.add('closed');
}

function addingHabit(event) {
    event.preventDefault();
    const form = event.target;

    const data = new FormData(form);
    const comm = data.get('habit_name');
    const goal = Number(data.get('goal'));

    habits =[
        ...habits,
        {
            "id": habits.length + 1,
            "name": comm,
            "target": goal,
            "days": []
        }
    ];
    
    form['habit_name'].value = '';
    form['goal'].value = '';
    
    rerender(habits[0].id);
    closeAdding();
    saveData();
}

function delHabit(){
    const habitToDel = page.header.delHabit.getAttribute('habit_id');
    habits = habits.filter(h => {
        if(h.id == habitToDel){
            return false
        }
        return true
    })

    saveData();
    rerender(habits[0].id);
}

(() => {
    loadData();
    rerender(habits[0].id);
})();