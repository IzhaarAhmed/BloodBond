-- Create function to update donor stats
CREATE OR REPLACE FUNCTION update_donor_stats(
  donor_id UUID,
  points_to_add INTEGER,
  donations_to_add INTEGER
)
RETURNS void AS $$
BEGIN
  UPDATE users 
  SET 
    total_donations = total_donations + donations_to_add,
    points = points + points_to_add,
    updated_at = NOW()
  WHERE id = donor_id AND role = 'donor';
END;
$$ LANGUAGE plpgsql;
