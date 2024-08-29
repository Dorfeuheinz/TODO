import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { v4 as uuidv4 } from "uuid";
import {
  Input,
  Select,
  Typography as AntTypography,
  Modal,
  Form,
  Button as AntdButton,
  Card,
} from "antd";
import { useEffect, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import axios from "axios";

const { Search } = Input;
const { Option } = Select;
const { Title } = AntTypography;
const { TextArea } = Input;

export interface TaskType {
  id: string;
  title: string;
  description: string;
  created_at: string; // Expecting ISO 8601 format
  status: string;
}

type ColumnMap = {
  TODO: TaskType[];
  IN_PROGRESS: TaskType[];
  DONE: TaskType[];
};

const columns: Array<keyof ColumnMap> = ["TODO", "IN_PROGRESS", "DONE"];

function ButtonAppBar() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <AssignmentIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1 }}
          >
            Task Manager
          </Typography>
          <Button color="inherit">Logout</Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

interface DroppableColumnProps {
  id: "TODO" | "IN_PROGRESS" | "DONE";
  tasks: TaskType[];
  onEdit: (task: TaskType) => void;
  onDelete: (taskId: string) => Promise<void>;
  onDrop: (taskId: string, newStatus: string) => void;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({ id, tasks, onEdit, onDelete, onDrop }) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className="column">
      <h4>{id}</h4>
      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        {tasks.map((task) => (
          <DraggableTask
            key={task.id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </SortableContext>
    </div>
  );
};

const DraggableTask: React.FC<{
  task: TaskType;
  onEdit: (task: TaskType) => void;
  onDelete: (id: string) => void;
}> = ({ task, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition: "transform 250ms ease",
    padding: "0.5rem",
    margin: "0.5rem 0",
    backgroundColor: "white",
    border: "1px solid black",
    borderRadius: "4px",
    position: "relative" as "relative",
  };

  console.log("Rendering task:", task); // Add logging

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style}>
      <Card
        title={task.title}
        extra={<AntdButton onClick={() => onDelete(task.id)} danger>Delete</AntdButton>}
        style={{ marginBottom: "0.5rem" }}
      >
        <p>{task.description}</p>
        <p>Created At: {new Date(task.created_at).toLocaleString()}</p>
        <p>Status: {task.status}</p>
        <div style={{ position: "absolute", top: "10px", right: "10px" }}>
          <AntdButton onClick={() => onEdit(task)} type="link">
            Edit
          </AntdButton>
        </div>
      </Card>
    </div>
  );
};


const Todo: React.FC = () => {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<TaskType[]>([]);
  const [sortBy, setSortBy] = useState<"recent" | "old">("recent");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editingTask, setEditingTask] = useState<TaskType | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();
  const columnsState:ColumnMap = {
    TODO: [],
    IN_PROGRESS: [],
    DONE: [],
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    applyFiltersAndSorting(tasks);
  }, [tasks, searchTerm, sortBy]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get<TaskType[]>(
        "http://localhost:5000/tasks"
      );
      console.log("Tasks fetched:", response.data); // Debug log
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const applyFiltersAndSorting = (tasks: TaskType[]) => {
    console.log("Applying filters and sorting");
    let filtered = tasks.filter((task) =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    filtered = filtered.sort((a, b) =>
      sortBy === "recent"
        ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    setFilteredTasks(filtered);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const movedTask = tasks.find((task) => task.id === activeId);
    if (!movedTask) return;

    const newStatus = overId;

    try {
      await axios.put(`http://localhost:5000/tasks/${activeId}`, {
        ...movedTask,
        status: newStatus,
      });
      fetchTasks();
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleSortChange = (value: "recent" | "old") => {
    setSortBy(value);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleAddTask = () => {
    setEditingTask(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditTask = (task: TaskType) => {
    setEditingTask(task);
    form.setFieldsValue(task);
    setIsModalVisible(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await axios.delete(`http://localhost:5000/tasks/${taskId}`);
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingTask) {
        await axios.put(
          `http://localhost:5000/tasks/${editingTask.id}`,
          values
        );
      } else {
        await axios.post("http://localhost:5000/tasks", {
          ...values,
          id: uuidv4(),
        });
      }
      fetchTasks();
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  return (
    <div>
      <ButtonAppBar />
      <Box sx={{ p: 3 }}>
        <Search
          placeholder="Search tasks..."
          onSearch={handleSearch}
          style={{ marginBottom: "1rem", width: "100%" }}
        />
        <Select
          defaultValue={sortBy}
          onChange={handleSortChange}
          style={{ width: "100%", marginBottom: "1rem" }}
        >
          <Option value="recent">Sort by Recent</Option>
          <Option value="old">Sort by Old</Option>
        </Select>
        <AntdButton type="primary" onClick={handleAddTask}>
          Add Task
        </AntdButton>
        <DndContext onDragEnd={handleDragEnd}>
          <SortableContext
            items={columns.flatMap((col) =>
              columnsState[col].map((task) => task.id)
            )}
            strategy={verticalListSortingStrategy}
          >
            {columns.map((column) => (
              <DroppableColumn
                key={column}
                id={column}
                tasks={columnsState[column]}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onDrop={(taskId, newStatus) => {
                  handleDragEnd({
                    active: { id: taskId },
                    over: { id: newStatus } as any,
                  } as DragEndEvent);
                }}
              />
            ))}
          </SortableContext>
        </DndContext>
        <Modal
          title={editingTask ? "Edit Task" : "Add Task"}
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={editingTask || { status: "TODO" }}
          >
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: "Please enter task title!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <TextArea rows={4} />
            </Form.Item>
            <Form.Item name="status" label="Status">
              <Select>
                <Option value="TODO">TODO</Option>
                <Option value="IN_PROGRESS">IN_PROGRESS</Option>
                <Option value="DONE">DONE</Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <AntdButton type="primary" htmlType="submit">
                {editingTask ? "Update Task" : "Add Task"}
              </AntdButton>
            </Form.Item>
          </Form>
        </Modal>
      </Box>
    </div>
  );
};

export default Todo;
