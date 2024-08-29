import React from 'react';
import SortableItem from 'components/SortableItem';
import { TaskType } from 'components/Todo';

type ColumnProps = {
  title: string;
  tasks: TaskType[];
};

const Column: React.FC<ColumnProps> = ({ title, tasks }) => (
  <div style={{ width: '30%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
    <h3>{title}</h3>
    {tasks.map(task => (
      <SortableItem key={task.id} id={task.id} task={task} />
    ))}
  </div>
);

export default Column;
