import React from 'react'
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"

interface SidebarProps {
  taskListFilter: string;
  setTaskListFilter: (filter: string) => void;
  allEpics: string[];
  selectedEpic: string | null;
  setSelectedEpic: (epic: string | null) => void;
  tagSearch: string;
  setTagSearch: (search: string) => void;
  filteredTags: string[];
  selectedTags: string[];
  toggleTagSelection: (tag: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  taskListFilter,
  setTaskListFilter,
  allEpics,
  selectedEpic,
  setSelectedEpic,
  tagSearch,
  setTagSearch,
  filteredTags,
  selectedTags,
  toggleTagSelection
}) => {
  return (
    <div className="w-64 bg-white p-4 shadow overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">タスクリスト</h2>
      <ul className="mb-4">
        <li key="all" className="mb-2">
          <Button
            variant={taskListFilter === "all" ? "secondary" : "ghost"}
            onClick={() => setTaskListFilter("all")}
            className="w-full justify-start"
          >
            すべてのタスク
          </Button>
        </li>
        <li key="important" className="mb-2">
          <Button
            variant={taskListFilter === "important" ? "secondary" : "ghost"}
            onClick={() => setTaskListFilter("important")}
            className="w-full justify-start text-yellow-500"
          >
            重要
          </Button>
        </li>
        <li key="completed" className="mb-2">
          <Button
            variant={taskListFilter === "completed" ? "secondary" : "ghost"}
            onClick={() => setTaskListFilter("completed")}
            className="w-full justify-start"
          >
            完了済み
          </Button>
        </li>
      </ul>
      <h3 className="font-bold mb-2">エピックで絞り込む</h3>
      <ul className="mb-4">
        {allEpics.map(epic => (
          <li key={epic} className="mb-2">
            <Button
              variant={selectedEpic === epic ? "secondary" : "ghost"}
              onClick={() => setSelectedEpic(selectedEpic === epic ? null : epic)}
              className="w-full justify-start"
            >
              {epic}
            </Button>
          </li>
        ))}
      </ul>
      <h3 className="font-bold mb-2">タグで絞り込む</h3>
      <div className="mb-2">
        <Input
          type="text"
          placeholder="タグを検索"
          value={tagSearch}
          onChange={(e) => setTagSearch(e.target.value)}
          className="w-full"
        />
      </div>
      <ul>
        {filteredTags.map(tag => (
          <li key={tag} className="mb-2">
            <Button
              variant={selectedTags.includes(tag) ? "secondary" : "ghost"}
              onClick={() => toggleTagSelection(tag)}
              className="w-full justify-start"
            >
              {tag}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Sidebar