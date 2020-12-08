class todos {
  constructor() {
    this.
    this.countTodos = document.querySelector('.js-count-todos')
  }
}

window.addEventListener('DOMContentLoaded', () => {

  
  const todoNew = document.querySelector('.js-todo-new')
  const countTodos = document.querySelector('.js-count-todos')//
  const clearTodos = document.querySelector('.js-clear-todos')
  const content = document.querySelector('.js-content')
  const active = document.querySelector('.js-active')
  const completed = document.querySelector('.js-completed')
  const todosAction = [...document.querySelectorAll('.js-todo-action-item')]
  let arrItem = localStorage.getItem('todoList')
    ? JSON.parse(localStorage.getItem('todoList'))
    : [];

  const countActive = () => countTodos.innerHTML = `${arrItem.filter(item => item.completed === false).length}`

  todosAction.forEach(item => {
    item.addEventListener('click', () => {
      itemDelete(content)

      switch (item.querySelector('input').value) {
        case 'active':
          loadData(arrItem.filter(item => item.completed === false), content)
          break
        case 'completed':
          loadData(arrItem.filter(item => item.completed === true), content)
          break
        default:
          loadData(arrItem, content)
      }
    })
  })

  // add item
  todoNew.addEventListener('keyup', e => {
    if (arrItem.length === 0) maxId = 1

    if (e.keyCode === 13 && todoNew.value !== '') {
      arrItem.push({
        'completed': false,
        'content': todoNew.value,
        'id': maxId
      });

      (completed.checked === false) && itemMaker(false, todoNew.value, maxId++, content)

      updateStorage(arrItem)
      todoNew.value = ''
      countActive()
    }
  })

  // remove item
  delegate(document, 'click', '.js-btn-remove', e => {
    let elementWrapper = e.target.closest('.todo-list__item')

    elementWrapper.remove()
    arrItem = arrItem.filter(item => item.id !== Number(elementWrapper.dataset.id));
    maxId = valueMax(arrItem)
    countActive()
    updateStorage(arrItem)
  })

  // remove all completed
  clearTodos.addEventListener('click', () => {
    arrItem = arrItem.filter(item => item.completed === false)
    itemDelete(content)
    updateStorage(arrItem)
    loadData(arrItem, content)
    countActive()
  })

  // edit value (event click outside)
  delegate(document, 'dblclick', '.js-content', e => {
    let elementWrapper = e.target.closest('.todo-list__item')
    e.target.disabled = false

    hideOnClickOutside(elementWrapper, () => {
      editValue(arrItem, elementWrapper, e.target.value)
      e.target.disabled = true
    })
  })

  // edit value (event keyup)
  delegate(document, 'keyup', '.js-content', e => {
    let elementWrapper = e.target.closest('.todo-list__item')

    if (e.keyCode === 13 && e.target.value !== '') {
      editValue(arrItem, elementWrapper, e.target.value)
      e.target.disabled = true
    }
  })

  // check checkbox
  delegate(document, 'change', '.js-checkbox', e => {
    let elementWrapper = e.target.closest('.todo-list__item')

    editValue(arrItem, elementWrapper, e.target.checked);
    (active.checked || completed.checked) && elementWrapper.remove()
    countActive()
  })

  //load data after refresh 
  let maxId = valueMax(arrItem)
  loadData(arrItem, content)
  countActive()
})

const itemMaker = (completed, content, id, location) => {
  const maker = `    
    <li class="u-flex-center todo-list__item" data-id="${id}" >
      <div style ="width: 100%;"> 
        <input type="checkbox" class="input-checkbox js-checkbox" ${completed === true ? completed = 'checked' : ''} >
        <input type="text" class="input-text js-content" disabled value="${content}" >
      </div>
      <button class="button js-btn-remove" >&#x2716</button>
    </li>`
  location.insertAdjacentHTML('afterbegin', maker)
}

const itemDelete = content => {
  while (content.firstChild) {
    content.removeChild(content.firstChild)
  }
}

const editValue = (arr, elementWrapper, value) => {
  arr.find(item => {
    if (item.id === Number(elementWrapper.dataset.id)) {
      value === true || value === false ?
        item.completed = value :
        item.content = value
    }
  })
  
  updateStorage(arr)
}

const loadData = (arr, location) => {
  arr.forEach((item) => {
    itemMaker(item.completed, item.content, item.id, location)
  })
}

const updateStorage = arr => localStorage.setItem('todoList', JSON.stringify(arr))

const valueMax = arr => Math.max.apply(Math, arr.map(item => item.id)) + 1

const isVisible = elem => !!elem && !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length)


const hideOnClickOutside = (element, fn) => {
  const outsideClickListener = event => {
    if (!element.contains(event.target) && isVisible(element)) {
      fn()
      removeClickListener()
    }
  }

  const removeClickListener = () => {
    document.removeEventListener('click', outsideClickListener)
  }

  document.addEventListener('click', outsideClickListener)
}

const delegate = (elSelector, eventName, selector, fn) => {

  elSelector.addEventListener(eventName, function (event) {
    var possibleTargets = elSelector.querySelectorAll(selector);
    var target = event.target;

    for (var i = 0, l = possibleTargets.length; i < l; i++) {
      var el = target;
      var p = possibleTargets[i];

      while (el && el !== elSelector) {
        if (el === p) {
          return fn.call(p, event);
        }

        el = el.parentNode;
      }
    }
  });
}