import { searchPeople } from "../services/searchService.js";

export async function search(req, res) {
  const result = await searchPeople(req.body);

  res.json(result);
}