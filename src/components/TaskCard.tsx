import { useState } from "react";
import TrashIcon from "../icons/TrashIcon";
import { Id, Task } from "./Types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  task: Task;
  deleteTask: (id: Id) => void;
  updateTask: (id: Id, content: string) => void;
}

const TaskCard = ({ task, deleteTask, updateTask }: Props) => {
  const [mouseIsOver, setMouseIsOver] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);

  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
    setMouseIsOver(false);
  };

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
    disabled: editMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div className="bg-mainBackgroundColor p-4 opacity-30 min-h{100px} h-{100px} flex items-center text-left ring-2 ring-red-500 rounded-xl relative" />
    );
  }

  if (editMode) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="bg-mainBackgroundColor p-4 w-full min-w-full  min-h{100px} h-{100px}  flex items-center text-left rounded-md hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab relative"
      >
        <textarea
          value={task.content}
          autoFocus
          placeholder="Enter task content"
          onBlur={toggleEditMode}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.shiftKey) return toggleEditMode();
          }}
          onChange={(e) => updateTask(task.id, e.target.value)}
          className="w-full h-[90%]  rounded-md outline-none resize-none bg-transparent  text-white"
        ></textarea>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={toggleEditMode}
      onMouseEnter={() => setMouseIsOver(true)}
      onMouseLeave={() => setMouseIsOver(false)}
      className="bg-mainBackgroundColor p-4   min-h{100px} h-{100px} flex items-center text-left rounded-xl
      hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab relative"
    >
      <p className="w-full h-[90%] my-auto whitespace-pre-wrap overflow-x-hidden overflow-y-auto task max-h-[90px]">
        {task.content}
      </p>

      {mouseIsOver && (
        <button
          onClick={() => deleteTask(task.id)}
          className="absolute p-2 -translate-y-1/2 rounded-md stroke-white right-4 top-1/2 bg-columnBackgroundColor opacity-60 hover:opacity-100"
        >
          <TrashIcon />
        </button>
      )}
    </div>
  );
};

export default TaskCard;
