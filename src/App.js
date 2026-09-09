import React from 'react';
import './App.css';

const emptyForm = {
  name: '',
  priority: 5,
  description: '',
  duration: '',
  subtasks: [],
};

let nextTaskId = 1;

function getPriorityLabel(priority) {
  if (priority < 3) return 'Not important';
  if (priority <= 7) return 'Standard';
  return 'Important';
}

function getDurationLabel(duration) {
  return duration > 24 ? 'Long task' : 'Short task';
}

function App() {
  const [tasks, setTasks] = React.useState([]);
  const [form, setForm] = React.useState(emptyForm);
  const [subtaskInput, setSubtaskInput] = React.useState('');
  const [editingId, setEditingId] = React.useState(null);
  const [errors, setErrors] = React.useState({});

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: name === 'priority' ? Number(value) : value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  }

  function addSubtask() {
    const value = subtaskInput.trim();
    if (!value) return;
    if (form.subtasks.some((subtask) => subtask.toLowerCase() === value.toLowerCase())) {
      setErrors((current) => ({ ...current, subtasks: 'Subtasks must be unique.' }));
      return;
    }
    setForm((current) => ({ ...current, subtasks: [...current.subtasks, value] }));
    setSubtaskInput('');
    setErrors((current) => ({ ...current, subtasks: '' }));
  }

  function removeSubtask(indexToRemove) {
    setForm((current) => ({
      ...current,
      subtasks: current.subtasks.filter((_, index) => index !== indexToRemove),
    }));
  }

  function validate() {
    const nextErrors = {};
    const name = form.name.trim();
    const description = form.description.trim();
    const duplicate = tasks.some((task) => task.name.toLowerCase() === name.toLowerCase() && task.id !== editingId);
    if (!name) nextErrors.name = 'Task name is required.';
    else if (name.length < 5) nextErrors.name = 'Task name must be at least 5 characters.';
    else if (duplicate) nextErrors.name = 'Task name must be unique.';
    if (form.priority < 1 || form.priority > 10) nextErrors.priority = 'Priority must be between 1 and 10.';
    if (form.subtasks.length < 1) nextErrors.subtasks = 'Add at least one subtask.';
    if (!description) nextErrors.description = 'Task description is required.';
    else if (description.length < 3) nextErrors.description = 'Description must be at least 3 characters.';
    if (!form.duration || Number(form.duration) < 1) nextErrors.duration = 'Duration must be at least 1 hour.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function submitTask(event) {
    event.preventDefault();
    if (!validate()) return;
    const task = { ...form, name: form.name.trim(), description: form.description.trim(), duration: Number(form.duration) };
    if (editingId) {
      setTasks((current) => current.map((item) => (item.id === editingId ? { ...task, id: editingId } : item)));
    } else {
      setTasks((current) => [...current, { ...task, id: nextTaskId++ }]);
    }
    resetForm();
  }

  function resetForm() {
    setForm({ ...emptyForm, subtasks: [] });
    setSubtaskInput('');
    setErrors({});
    setEditingId(null);
  }

  function editTask(task) {
    setForm({ name: task.name, priority: task.priority, description: task.description, duration: String(task.duration), subtasks: [...task.subtasks] });
    setEditingId(task.id);
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function deleteTask(id) {
    setTasks((current) => current.filter((task) => task.id !== id));
    if (editingId === id) resetForm();
  }

  return (
    <main className="app-shell">
      <section className="task-panel" aria-labelledby="form-title">
        <div className="section-heading">
          <div>
            <h2 id="form-title">{editingId ? 'Update a task' : 'Create a task'}</h2>
          </div>
          {editingId && <button className="text-button" type="button" onClick={resetForm}>Cancel update</button>}
        </div>
        <form onSubmit={submitTask} noValidate>
          <div className="form-grid">
            <label className="field field-wide">
              <span>Task name</span>
              <input name="name" value={form.name} onChange={updateField} placeholder="e.g. Prepare presentation" />
              {errors.name && <small className="error">{errors.name}</small>}
            </label>
            <label className="field">
              <span>Priority <strong>{form.priority}</strong></span>
              <input name="priority" type="range" min="1" max="10" value={form.priority} onChange={updateField} />
              <small className="field-hint">{getPriorityLabel(form.priority)}</small>
              {errors.priority && <small className="error">{errors.priority}</small>}
            </label>
            <label className="field field-wide">
              <span>Description</span>
              <textarea name="description" value={form.description} onChange={updateField} placeholder="What needs to be done?" rows="3" />
              {errors.description && <small className="error">{errors.description}</small>}
            </label>
            <label className="field">
              <span>Duration (hours)</span>
              <input name="duration" type="number" min="1" value={form.duration} onChange={updateField} placeholder="Enter hours" />
              {form.duration && <small className="field-hint">{getDurationLabel(Number(form.duration))}</small>}
              {errors.duration && <small className="error">{errors.duration}</small>}
            </label>
          </div>

          <div className="subtask-editor">
            <label className="field">
              <span>Subtasks</span>
              <div className="inline-input">
                <input value={subtaskInput} onChange={(event) => setSubtaskInput(event.target.value)} placeholder="Add a smaller step" onKeyDown={(event) => event.key === 'Enter' && (event.preventDefault(), addSubtask())} />
                <button className="secondary-button" type="button" onClick={addSubtask}>Add subtask</button>
              </div>
              {errors.subtasks && <small className="error">{errors.subtasks}</small>}
            </label>
            {form.subtasks.length > 0 && <ul className="subtask-list">{form.subtasks.map((subtask, index) => <li key={`${subtask}-${index}`}><span>{subtask}</span><button type="button" aria-label={`Remove ${subtask}`} onClick={() => removeSubtask(index)}>Remove</button></li>)}</ul>}
          </div>
          <button className="primary-button" type="submit">{editingId ? 'Save changes' : 'Register task'}</button>
        </form>
      </section>

      <section className="task-list-section" aria-labelledby="list-title">
        <div className="list-heading">
          <div>
            <h2 id="list-title">List of my tasks</h2>
          </div>
          <span className="task-count">{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</span>
        </div>
        {tasks.length === 0 ? <div className="empty-state"><span className="empty-mark">+</span><p>No tasks yet</p><small>Create your first scheduled task above.</small></div> : <div className="task-list">{tasks.map((task) => <article className="task-card" key={task.id}>
          <div className="task-card-top"><div><span className="task-id">Task #{task.id}</span><h3>{task.name}</h3></div><span className={`priority-badge priority-${task.priority < 3 ? 'low' : task.priority <= 7 ? 'medium' : 'high'}`}>{getPriorityLabel(task.priority)}</span></div>
          <p className="task-description">{task.description}</p>
          <div className="task-meta"><span>{task.duration} {task.duration === 1 ? 'hour' : 'hours'} / {getDurationLabel(task.duration)}</span><span>Priority {task.priority}/10</span></div>
          <div className="card-subtasks"><span>Subtasks</span><ul>{task.subtasks.map((subtask, index) => <li key={`${task.id}-${index}`}>{subtask}</li>)}</ul></div>
          <div className="task-actions"><button className="secondary-button" type="button" onClick={() => editTask(task)}>Update</button><button className="danger-button" type="button" onClick={() => deleteTask(task.id)}>Delete</button></div>
        </article>)}</div>}
      </section>
    </main>
  );
}

export default App;
