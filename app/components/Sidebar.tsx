import React from 'react'
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import type { Epic } from '~/types/task'

interface SidebarProps {
  taskListFilter: string;
  setTaskListFilter: (filter: string) => void;
  epics: Epic[];
  selectedEpic: Epic | null;
  setSelectedEpic: (epic: Epic | null) => void;
  tagSearch: string;
  setTagSearch: (search: string) => void;
  filteredTags: string[];
  selectedTags: string[];
  toggleTagSelection: (tag: string) => void;
  newEpicTitle: string;
  setNewEpicTitle: (title: string) => void;
  handleAddEpic: (e: React.FormEvent<HTMLFormElement>) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  taskListFilter,
  setTaskListFilter,
  epics,
  selectedEpic,
  setSelectedEpic,
  tagSearch,
  setTagSearch,
  filteredTags,
  selectedTags,
  toggleTagSelection,
  newEpicTitle,
  setNewEpicTitle,
  handleAddEpic
}) => {
  return (
    <div className="w-64 bg-white p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">タスクリスト</h2>
      <ul className="mb-4">
        {["all", "important", "completed"].map((filter) => (
          <li key={filter} className="mb-2">
            <Button
              variant={taskListFilter === filter ? "secondary" : "ghost"}
              onClick={() => setTaskListFilter(filter)}
              className="w-full justify-start"
            >
              {filter === "all" && "すべてのタスク"}
              {filter === "important" && <span className="text-yellow-500">重要</span>}
              {filter === "completed" && "完了済み"}
            </Button>
          </li>
        ))}
      </ul>
      
      <div className="mb-4">
        <h3 className="font-semibold mb-2">エピックで絞込む</h3>
        <form onSubmit={handleAddEpic} className="mb-2">
          <Input
            type="text"
            placeholder="新しいエピック"
            value={newEpicTitle}
            onChange={(e) => setNewEpicTitle(e.target.value)}
            className="mb-2"
          />
          <Button type="submit" className="w-full">追加</Button>
        </form>
        {epics.length > 0 ? (
          epics.map(epic => (
            <Button
              key={epic.id}
              variant={selectedEpic?.id === epic.id ? "secondary" : "ghost"}
              className={`w-full justify-start mb-1 ${selectedEpic?.id === epic.id ? 'border-2 border-blue-500' : ''}`}
              onClick={() => setSelectedEpic(selectedEpic?.id === epic.id ? null : epic)}
            >
              {epic.title || 'タイトルなし'}
            </Button>
          ))
        ) : (
          <p>エピックがありません</p>
        )}
      </div>
      
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
        {filteredTags.length > 0 ? (
          filteredTags.map(tag => (
            <li key={tag} className="mb-2">
              <Button
                variant={selectedTags.includes(tag) ? "secondary" : "ghost"}
                onClick={() => toggleTagSelection(tag)}
                className={`w-full justify-start ${selectedTags.includes(tag) ? 'border-2 border-blue-500' : ''}`}
              >
                {tag}
              </Button>
            </li>
          ))
        ) : (
          <li>タグがありません</li>
        )}
      </ul>
    </div>
  )
}

export default Sidebar
