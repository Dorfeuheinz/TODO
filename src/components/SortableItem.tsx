import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskType } from 'components/Todo';

type SortableItemProps = {
  id: string;
  task: TaskType;
};

const SortableItem: React.FC<SortableItemProps> = ({ id, task }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: '10px',
    margin: '5px 0',
    border: '1px solid #ccc',
    borderRadius: '4px',
    background: '#fff',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <strong>{task.title}</strong>
      <p>{task.description}</p>
      <small>{new Date(task.created_at).toLocaleString()}</small>
    </div>
  );
};

export default SortableItem;
