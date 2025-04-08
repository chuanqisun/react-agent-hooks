// simulate async data loading
export async function listMyAgents() {
  return import("../../data/main.json").then((data) => {
    return data.agents;
  });
}
