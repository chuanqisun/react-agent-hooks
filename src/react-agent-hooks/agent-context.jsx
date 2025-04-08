/** (Optional) Hierarchical state organization
 *
 * Agent state:
 * - Navigation overview
 *   - Agent states and tool names
 * - Navigation details
 *  - Page header
 *   - Agent states and tool names
 *  - Page body
 *   - Agent states and tool names
 *
 */

export function ParentComponent() {
  return (
    <MyApp>
      <AgentContext name="Navigation overview">
        <NavMenu></NavMenu>
      </AgentContext>
      <AgentContext name="Navigation details">
        <ChildComponent />
      </AgentContext>
    </MyApp>
  );
}

export function ChildComponent() {
  return (
    <>
      <AgentContext name="Page header">
        <HeaderContent></HeaderContent>
      </AgentContext>
      <AgentContext name="Page body">
        <PageContent></PageContent>
      </AgentContext>
    </>
  );
}
