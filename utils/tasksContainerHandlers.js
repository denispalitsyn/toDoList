import { deleteTask, getTask, updateTask } from '../api/task';
import { modes, statuses } from './constants';
import { createModalHtml } from './htmlTemplates';
import {
  makeTextIfNoTasksInContainer,
  renderNewArchiveTask,
  renderNewTask,
} from './renders';
import { closeTaskModal, openTaskModal } from './taskModalHandlers';
import { removeElementAfterAnimationPromise } from './utils';

export async function onActiveTasksContainerClick(event) {
  const taskContainer = event.target.closest('.task');
  const taskCheckbox = event.target.closest('[data-task-checkbox]');
  const taskContent = event.target.closest('[data-task-content]');

  if (taskCheckbox && event.target.tagName !== 'INPUT') {
    const taskId = taskCheckbox.dataset.taskId;

    taskContainer.classList.add('disabled');

    try {
      const archiveTask = await updateTask({
        id: taskId,
        status: statuses.archive,
      });

      taskContainer.classList.add('closeTask');

      await removeElementAfterAnimationPromise(taskContainer);

      renderNewArchiveTask(archiveTask);
    } catch (error) {
      console.log('error', error);

      taskContainer.classList.remove('disabled');
    }
  }

  if (taskContent) {
    const taskId = taskContent.dataset.taskId;

    openTaskModal(modes.edit, taskId);

    try {
      const task = await getTask(taskId);

      const taskModal = document.querySelector('#task-modal');
      const taskLoader = document.querySelector('#task-loader');

      if (taskModal && taskLoader) {
        const elements = taskModal.elements;

        elements.title.value = task.title;
        elements.description.value = task.description;
        elements.priority.value = task.priority;

        taskLoader.remove();
      }
    } catch (error) {
      console.log('error', error);

      closeTaskModal();
    }
  }
}

export async function onArchiveTasksContainerClick(event) {
  const taskContainer = event.target.closest('.task');
  const taskCheckbox = event.target.closest('[data-task-checkbox]');
  const deleteTaskButton = event.target.closest('[data-delete-task-button]');

  const closeTask = () => {
    taskContainer.classList.add('closeTask');

    return removeElementAfterAnimationPromise(taskContainer);
  };

  if (taskCheckbox && event.target.tagName !== 'INPUT') {
    taskContainer.classList.add('disabled');

    try {
      const updatedTask = await updateTask({
        id: taskCheckbox.dataset.archiveTaskId,
        status: statuses.active,
      });

      await closeTask();

      renderNewTask(updatedTask);
    } catch (error) {
      console.log('error', error);

      taskContainer.classList.remove('disabled');
    }
  }

  if (deleteTaskButton) {
    const modalHtml = createModalHtml({
      title: `Вы уверены, что хотите удалить задачу "${deleteTaskButton.dataset.taskTitle}"?`,
      submitButtonText: 'Удалить',
    });

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modalContainer = document.querySelector('[data-modal-container]');
    const closeModalButton = document.querySelector(
      '[data-close-modal-button]'
    );
    const submitModalButton = document.querySelector(
      '[data-submit-modal-button]'
    );

    const closeModal = () => {
      modalContainer.classList.add('smoothClose');

      return removeElementAfterAnimationPromise(modalContainer, () => {
        modalContainer.removeEventListener('click', onModalContainerClick);
        closeModalButton.removeEventListener('click', closeModal);
        submitModalButton.removeEventListener(
          'click',
          onSubmitModalButtonClick
        );
      });
    };

    const onModalContainerClick = (event) => {
      if (event.target.dataset.hasOwnProperty('modalContainer')) {
        closeModal();
      }
    };

    const onSubmitModalButtonClick = async () => {
      try {
        await deleteTask(taskContainer.dataset.archiveTaskContainerId);

        await closeModal();

        await closeTask();

        makeTextIfNoTasksInContainer(
          document.querySelector('#archive-tasks-container')
        );
      } catch (error) {
        console.log('error', error);
      }
    };

    modalContainer.addEventListener('click', onModalContainerClick);
    closeModalButton.addEventListener('click', closeModal);
    submitModalButton.addEventListener('click', onSubmitModalButtonClick);
  }
}
