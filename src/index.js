class HabitStorage {
    #KEY = 'HABIT_KEY'

    loadData() {
        try{
            const habitString = localStorage.getItem(this.#KEY);
            const habitArr = JSON.parse(habitString);
            return habitArr;
        } catch {
            return [];
        }
    }

    saveData(data) {
        localStorage.setItem(this.#KEY, JSON.stringify(data))
    }
}

class HabitStore {
    constructor(storage) {
        this.storage = storage;
        this.habits = this.storage.loadData();
        this.activeHabit = this.habits[0] || null;
    }

    changeActiveHabit(newActiveHabitId) {
        this.activeHabit = this.habits.find(h => h.id == newActiveHabitId);
    }

    addHabit(newHabit) {
        this.habits.push(newHabit);
        this.storage.saveData(this.habits);
        this.activeHabit = newHabit;
    }
    delHabit(habitId){
        this.habits = this.habits.filter(h => {
            if(h.id == habitId){
                return false
            }
            return true
        });

        this.activeHabit = this.habits[0] || null;
        this.storage.saveData(this.habits);
    }

    addDay(thisHabit, comment) {
        this.habits = this.habits.map(habit => {
            if(habit.id == thisHabit.id){
                return {
                    ...habit,
                    days: habit.days.concat(comment)
                }
            }
            return habit;
        });

        this.activeHabit = this.habits.find(h => h.id == thisHabit.id);
        this.storage.saveData(this.habits);
    }
    delDay(activeHabitId, commIndex) {
        this.habits = this.habits.map(habit => {
            if(habit.id === activeHabitId){
                habit.days.splice(commIndex, 1);
            }
            return habit;
        })
        
        this.activeHabit = this.habits.find(h => h.id == activeHabitId);
        this.storage.saveData(this.habits);
    }
}

class AddDayForm {
    constructor(activeHabit, add) {
        this.activeHabit = activeHabit;
        this.add = add;
    }

    render(nextDayNum) {
        const el = document.createElement('div');
        el.classList.add('day', 'last_day');
        el.innerHTML = `<div class="day_h">
                        <h3 class="next_day">День ${nextDayNum}</h3>
                    </div>
                    <hr>
                    <form class="day_comm" data-habit-id="${this.activeHabit.id}">
                        <textarea name="comment" class="comm" placeholder="..." maxlength="250"></textarea>
                        <button id="add_day">Добавить день</button>
                    </form>`;
        
        el.querySelector('.day_comm').addEventListener('submit', (event) => {
            event.preventDefault();
            const comment = this.handelSubmit(event);
            this.add(comment);
        });

        return el;
    }

    handelSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const data = new FormData(form);
        const comment = data.get('comment');
        
        form['comment'].classList.remove('empty');
        if(!comment){
            form['comment'].classList.add('empty');
        }

        form['comment'].value = '';

        return [{ comment }]
    }
}

class AddHabitForm {
    constructor(onAdd) {
        this.onAdd = onAdd;

        document.querySelector('.new_habit').addEventListener('submit', (event) => {
            this.handleSubmit(event)}
        );
    }

    handleSubmit(event) {
        event.preventDefault();
        const form = event.target;

        const data = new FormData(form);
        const comm = data.get('habit_name');
        const goal = Number(data.get('goal'));

        const newHabit = {
            "id": Math.round((Math.random() + 1) * 10000),
            "name": comm,
            "target": goal,
            "days": []
        }

        form['habit_name'].value = '';
        form['goal'].value = '';
        this.closeAdding();

        this.onAdd(newHabit);
    }

    showAdding() {
        document.querySelector('.cover').classList.remove('closed');
    }
    closeAdding() {
        document.querySelector('.cover').classList.add('closed');
    }
}

class App {
    page = {
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

    constructor() {
        this.storage = new HabitStorage();
        this.store = new HabitStore(this.storage);
        this.AddHabitForm = new AddHabitForm((newHabit) => {
            this.store.addHabit(newHabit);
            this.rerender();
        });

        this.init();
        if(this.store.activeHabit){
            this.rerender();
        } else {
            this.rerenderEmpty();
        }
    }


    init() {
        document.querySelector('.add_but').addEventListener('click', () => this.AddHabitForm.showAdding());
        document.querySelector('.close').addEventListener('click', () => this.AddHabitForm.closeAdding());
        document.querySelector('.delHabit_but').addEventListener('click', () => {
            const habitToDel = this.page.header.delHabit.getAttribute('habit_id');
            this.store.delHabit(habitToDel);

            if(this.store.activeHabit){
                this.rerender();
            } else {
                this.rerenderEmpty();
            }
        });
        if(document.querySelector('.day_comm')) {
        }
    }

    rerenderMenu(activeHabit) {
        this.page.menu.innerHTML = '';
        for(const habit of this.store.habits) {
            const el = document.createElement('button');
            el.setAttribute('habit_id', habit.id);
            el.classList.add('menu_but');
            el.classList.add('habit_but');
            el.addEventListener('click', () => {
                this.store.changeActiveHabit(habit.id);
                this.rerender();
            });
            el.innerHTML = '<img src="./static/img/Star.svg" alt="">';

            if(activeHabit.id === habit.id){
                el.classList.add('menu_but_active');
            }

            this.page.menu.appendChild(el);
        }
    }

    renderHead(activeHabit) {
        if(this.page.header.delHabit.classList.contains('closed')) {
            document.querySelector('.delHabit_but').classList.remove('closed');
        }
        this.page.header.h.innerText = activeHabit.name;
        this.page.header.delHabit.setAttribute('habit_id', activeHabit.id);
        if(activeHabit.days.length < activeHabit.target) {
            this.page.header.prog_days.innerText = `${activeHabit.days.length} из ${activeHabit.target}`;    
        } else {
            this.page.header.prog_days.innerText = `Цель достигнута!`;
        }
    }

    rerenderDays(activeHabit) {
        this.page.content.days_box.innerHTML = '';

        if(!activeHabit) return;

        for(const day in activeHabit.days){
            const el = document.createElement('div');
            el.classList.add('day');
            el.innerHTML = `<div class="day_h">
                        <h3>День ${Number(day) + 1}</h3>
                        <button class="del_but">
                            <img src="./static/img/delete.svg" alt="">
                        </button>
                    </div>
                    <hr>
                    <div class="day_comm">
                        ${activeHabit.days[day].comment}
                    </div>`;
            
            el.querySelector('.del_but').addEventListener('click', () => {
                this.store.delDay(activeHabit.id, day);
                this.rerender();
            });
            
            this.page.content.days_box.appendChild(el);
        }
        
        if(activeHabit.days.length < activeHabit.target) {
            const nextDayForm = new AddDayForm(activeHabit, (comment) => {
                this.store.addDay(activeHabit, comment);
                this.rerender();
            });

            const nextDayNum = activeHabit.days.length + 1;
            this.page.content.days_box.appendChild(nextDayForm.render(nextDayNum));
        }
    }

    rerender() {
        const activeHabit = this.store.activeHabit;
        if(!activeHabit) return;

        this.rerenderMenu(activeHabit);
        this.renderHead(activeHabit);
        this.rerenderDays(activeHabit);
    }

    rerenderEmpty() {
        this.page.header.h.innerText = 'Создайте свою первую привычку!';
        this.page.header.prog_days.innerText = '?';
        document.querySelector('.delHabit_but').classList.add('closed');

        this.page.content.days_box.innerHTML = '';
        this.page.menu.innerHTML = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new App();
});