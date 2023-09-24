import { createTask, updateTask } from '../api/task';
import { modes } from './constants';
import { createTaskModalHtml } from './htmlTemplates';
import { renderNewTask, renderUpdatedTask } from './renders';

export function openTaskModal(mode = modes.create, taskId) {
  const taskModalHtml = createTaskModalHtml(mode);

  document.body.insertAdjacentHTML('beforeend', taskModalHtml);

  const taskModalContainer = document.querySelector('#taskModalContainer');
  const taskModal = document.querySelector('#taskModal');
  const closeTaskModalButton = document.querySelector('#closeTaskModalButton');
  const submitTaskModalFormButton = document.querySelector(
    '#submitTaskModalFormButton'
  );

  const closeTaskModal = () => {
    return new Promise((res) => {
      taskModalContainer.classList.add('smoothClose');

      const onAnimationEnd = () => {
        closeTaskModalButton.removeEventListener('click', closeTaskModal);

        taskModalContainer.removeEventListener('animationend', onAnimationEnd);
        taskModalContainer.removeEventListener(
          'click',
          onTaskModalContainerClick
        );

        taskModalContainer.remove();

        res();
      };

      taskModalContainer.addEventListener('animationend', onAnimationEnd);
    });
  };

  const onTaskModalContainerClick = (event) => {
    if (event.target.id === 'taskModalContainer') {
      closeTaskModal();
    }
  };

  closeTaskModalButton.addEventListener('click', closeTaskModal);

  taskModalContainer.addEventListener('click', onTaskModalContainerClick);

  taskModal.addEventListener('submit', async (event) => {
    event.preventDefault();

    const elements = event.target.elements;

    const title = elements.title;
    const description = elements.description;
    const priority = elements.priority;

    const taskData = {
      title: title.value,
      description: description.value,
      priority: priority.value,
    };

    try {
      title.setAttribute('disabled', 'true');
      description.setAttribute('disabled', 'true');
      priority.setAttribute('disabled', 'true');
      closeTaskModalButton.setAttribute('disabled', 'true');
      submitTaskModalFormButton.setAttribute('disabled', 'true');

      if (mode === modes.create) {
        const newTask = await createTask(taskData);

        await closeTaskModal();

        renderNewTask(newTask);
      } else {
        const updatedTask = await updateTask({
          id: taskId,
          ...taskData,
        });

        await closeTaskModal();

        renderUpdatedTask(updatedTask);
      }
    } catch (error) {
      console.log('error', error);

      title.removeAttribute('disabled');
      description.removeAttribute('disabled');
      priority.removeAttribute('disabled');
      closeTaskModalButton.removeAttribute('disabled');
      submitTaskModalFormButton.removeAttribute('disabled');
    }
  });
}
