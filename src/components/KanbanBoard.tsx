import { useMemo, useState } from "react";
import PlusIcon from "../icons/PlusIcon";
import { Column, Id, Task } from "./Types";
import ColumnContainer from "./ColumnContainer";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import TaskCard from "./TaskCard";

const KanbanBoard = () => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Columns functions
  const createNewColumn = () => {
    const columnToAdd: Column = {
      id: generateId(),
      title: `Column ${columns.length + 1}`,
    };

    setColumns([...columns, columnToAdd]);
  };
  const generateId = () => {
    return Math.floor(Math.random() * 10001);
  };

  const deleteColumn = (id: Id) => {
    const filteredColumn = columns.filter((col) => col.id !== id);
    setColumns(filteredColumn);

    const filteredTasks = tasks.filter((t) => t.columnId !== id);
    setTasks(filteredTasks);
  };

  const updateColumn = (id: Id, title: string) => {
    const newColumns = columns.map((col) => {
      if (col.id === id) {
        return {
          ...col,
          title,
        };
      }
      return col;
    });
    setColumns(newColumns);
  };

  // Tasks functions
  const createTask = (columnId: Id) => {
    const newTask: Task = {
      id: generateId(),
      content: `Task ${tasks.length + 1}`,
      columnId,
    };

    setTasks([...tasks, newTask]);
  };

  const deleteTask = (id: Id) => {
    const newTasks = tasks.filter((t) => t.id !== id);
    setTasks(newTasks);
  };

  const updateTask = (id: Id, content: string) => {
    const newTasks = tasks.map((t) => {
      if (t.id !== id) return t;
      return {
        ...t,
        content,
      };
    });

    setTasks(newTasks);
  };

  // Drag and drop functions
  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current?.column);
      return;
    }
    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current?.task);
      return;
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;

    if (!over) return;

    const activeColumnId = active.id;
    const overColumnId = over.id;

    if (activeColumnId === overColumnId) return;

    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex(
        (col) => col.id === activeColumnId
      );

      const overColumnIndex = columns.findIndex(
        (col) => col.id === overColumnId
      );

      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";

    if (!isActiveTask) return;

    // Dropping a task over another task

    if (isActiveTask && isOverTask) {
      setTasks((tasks) => {
        const activeTaskIndex = tasks.findIndex((t) => t.id === activeId);
        const overTaskIndex = tasks.findIndex((t) => t.id === overId);

        tasks[activeTaskIndex].columnId = tasks[overTaskIndex].columnId;

        return arrayMove(tasks, activeTaskIndex, overTaskIndex);
      });
    }

    const isOverColumn = over.data.current?.type === "Column";

    // Dropping a task over a column

    if (isActiveTask && isOverColumn) {
      setTasks((tasks) => {
        const activeTaskIndex = tasks.findIndex((t) => t.id === activeId);

        tasks[activeTaskIndex].columnId = overId;

        return arrayMove(tasks, activeTaskIndex, activeTaskIndex);
      });
    }
  };

  return (
    <>
      <div className="m-auto flex min-h-screen items-center overflow-x-auto overflow-y-auto px-[40px]">
        <DndContext
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
          sensors={sensors}
        >
          <div className="flex gap-2 m-auto">
            <div className="flex gap-4">
              <SortableContext items={columnsId}>
                {columns.map((col) => (
                  <ColumnContainer
                    key={col.id}
                    column={col}
                    deleteColumn={deleteColumn}
                    updateTask={updateTask}
                    updateColumn={updateColumn}
                    deleteTask={deleteTask}
                    createTask={createTask}
                    tasks={tasks.filter((t) => t.columnId === col.id)}
                  />
                ))}
              </SortableContext>
            </div>
            <button
              onClick={createNewColumn}
              className="h-[60px] w-[350px] min-w-[350px] cursor-pointer rounded-lg bg-mainBgColor border-columnBgColor  ring-rose-500 ring-[0.5px] hover:ring-2 duration-500 flex items-center gap-2"
            >
              <PlusIcon /> Add new column
              {createPortal(
                <DragOverlay>
                  {activeColumn && (
                    <ColumnContainer
                      deleteTask={deleteTask}
                      createTask={createTask}
                      column={activeColumn}
                      updateTask={updateTask}
                      deleteColumn={deleteColumn}
                      updateColumn={updateColumn}
                      tasks={tasks.filter(
                        (t) => t.columnId === activeColumn.id
                      )}
                    />
                  )}
                  {activeTask && (
                    <TaskCard
                      task={activeTask}
                      deleteTask={deleteTask}
                      updateTask={updateTask}
                    />
                  )}
                </DragOverlay>,
                document.body
              )}
            </button>
          </div>
        </DndContext>
      </div>
    </>
  );
};

export default KanbanBoard;
