import { SortableContext, useSortable } from "@dnd-kit/sortable";
import TrashIcon from "../icons/TrashIcon";
import { Column, Id, Task } from "./Types";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import PlusIcon from "../icons/PlusIcon";
import TaskCard from "./TaskCard";
interface Props {
  column: Column;
  deleteColumn: (id: Id) => void;
  updateColumn: (id: Id, title: string) => void;
  createTask: (columnId: Id) => void;
  tasks: Task[];
  deleteTask: (id: Id) => void;
  updateTask: (id: Id, content: string) => void;
}

const ColumnContainer = ({
  column,
  deleteColumn,
  updateColumn,
  createTask,
  tasks,
  deleteTask,
  updateTask,
}: Props) => {
  const [editMode, setEditMode] = useState<boolean>(false);
  const tasksIds = useMemo(() => tasks.map((task) => task.id), [tasks]);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
    disabled: editMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-mainBgColor
        opacity-30
        w-[350px]
        h-[500px]
        max-h-[500px]
        rounded-md
        border-4
        border-rose-800
"
      ></div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-columnBackgroundColor
    w-[350px]
    h-[500px]
    max-h-[500px]
    rounded-md
    flex
    flex-col


    "
    >
      {/*column title */}
      <div
        {...attributes}
        {...listeners}
        onClick={() => setEditMode(true)}
        className="
         bg-columnBackgroundColor 
         text-md h-[60px] 
         cursor-grab 
         rounded-md 
         rounded-b-none 
         p-3 
         font-bold  
         ring-1
         ring-rose-500/20
        
         flex
         items-center
         justify-between"
      >
        <div className="flex gap-2">
          <div className="flex items-center justify-center px-2 py-1 text-sm rounded-full bg-mainBgColor">
            0
          </div>

          {!editMode && column.title}
          {editMode && (
            <>
              <input
                type="text"
                value={column.title}
                autoFocus
                onChange={(e) => updateColumn(column.id, e.target.value)}
                onBlur={() => setEditMode(false)}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  setEditMode(false);
                }}
                className="text-center text-white border-0 rounded-md outline-none bg-mainBackgroundColor/30 ring-1 ring-rose-500/60 focus:border-0 focus:ring-1 focus:ring-rose-500 focus:outline-none"
              />
            </>
          )}
        </div>
        <button
          onClick={() => deleteColumn(column.id)}
          className="px-1 py-2 rounded stroke-gray-500 hover:stroke-white hover:bg-columnBgColor"
        >
          <TrashIcon />
        </button>
      </div>
      {/*column task container*/}

      <div className="flex flex-col flex-grow gap-4 p-2 overflow-x-hidden overflow-y-auto">
        <SortableContext items={tasksIds}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              deleteTask={deleteTask}
              updateTask={updateTask}
            />
          ))}
        </SortableContext>
      </div>
      {/*column footer */}

      <button
        onClick={() => createTask(column.id)}
        className="flex items-center gap-2 p-4 border-2 rounded-md border-columnBackgroundColor border-x-columnBackgroundColor hover:text-rose-500 active:bg-black/30"
      >
        <PlusIcon />
        Add Task
      </button>
    </div>
  );
};

export default ColumnContainer;
