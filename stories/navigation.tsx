import { cn } from "../src/utils.js"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsNav,
  TabsTrigger,
  tabsTriggerVariants,
} from "../src/tabs.js"

/** Default and line tab lists with panels. */
export function TabsStory() {
  return (
    <div className="grid gap-8">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Overview panel</TabsContent>
        <TabsContent value="activity">Activity panel</TabsContent>
      </Tabs>
      <Tabs defaultValue="list">
        <TabsList variant="line">
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="board">Board</TabsTrigger>
        </TabsList>
        <TabsContent value="list">List panel</TabsContent>
        <TabsContent value="board">Board panel</TabsContent>
      </Tabs>
    </div>
  )
}

/** URL-style tab links; the active item uses aria-current. */
export function TabsNavStory() {
  return (
    <TabsNav aria-label="Preview views">
      <a
        href="#list"
        aria-current="page"
        data-state="active"
        className={cn(tabsTriggerVariants())}
      >
        List
      </a>
      <a
        href="#board"
        data-state="inactive"
        className={cn(tabsTriggerVariants())}
      >
        Board
      </a>
    </TabsNav>
  )
}
