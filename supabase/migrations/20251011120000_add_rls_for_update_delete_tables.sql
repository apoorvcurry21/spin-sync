CREATE POLICY "Users can update their own tables"
  ON public.ping_pong_tables FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own tables"
  ON public.ping_pong_tables FOR DELETE
  USING (auth.uid() = created_by);
