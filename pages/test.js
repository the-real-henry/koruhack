// pages/api/test.js
import { supabase } from '../../utils/db';

export default async function handler(req, res) {
  const { data, error } = await supabase
    .from('school')
    .select('*');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ schools: data });
}
