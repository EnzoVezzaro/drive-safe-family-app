CREATE OR REPLACE FUNCTION get_scores(input_user_id TEXT)
RETURNS TABLE (
  score INTEGER,
  user_id TEXT,
  users JSON
) AS $$
BEGIN
  RETURN QUERY
  WITH violation_counts AS (
    SELECT 
      v.user_id AS violation_user_id,
      v.type AS violation_type,
      COALESCE(v.severity, 1) AS severity,  -- Ensure severity is not NULL
      COUNT(v.id) AS violation_count
    FROM 
      violations v
    WHERE 
      v.timestamp >= CURRENT_DATE - INTERVAL '7 days'  -- Filter for last 7 days
    GROUP BY 
      v.user_id, v.type, v.severity
  ),
  user_violations AS (
    SELECT 
      u.id AS user_id,
      u.email,
      COUNT(v.id) AS total_violations
    FROM 
      users u
    LEFT JOIN 
      violations v ON u.id = v.user_id AND v.timestamp >= CURRENT_DATE - INTERVAL '7 days'  -- Filter for last 7 days
    WHERE 
      u.id = input_user_id  -- Filter users by input_user_id
      OR u.parent = input_user_id  -- Filter users by parent
    GROUP BY 
      u.id, u.email
  ),
  severity_counts AS (
    SELECT
      violation_user_id AS user_id,
      violation_type,
      SUM(CASE WHEN severity = 1 THEN violation_count ELSE 0 END) AS severity_1,
      SUM(CASE WHEN severity = 2 THEN violation_count ELSE 0 END) AS severity_2,
      SUM(CASE WHEN severity = 3 THEN violation_count ELSE 0 END) AS severity_3,
      SUM(CASE WHEN severity = 4 THEN violation_count ELSE 0 END) AS severity_4,
      SUM(CASE WHEN severity = 5 THEN violation_count ELSE 0 END) AS severity_5
    FROM
      violation_counts
    GROUP BY
      violation_user_id, violation_type
  )
  SELECT 
      uv.user_id,
      uv.email,
      COALESCE(uv.total_violations, 0) AS total_violations,  -- Handle users with no violations
      jsonb_object_agg(
          COALESCE(vc.violation_type, 'UNKNOWN'),
          jsonb_build_object(
              'count', vc.violation_count,
              'severity_1', sc.severity_1,
              'severity_2', sc.severity_2,
              'severity_3', sc.severity_3,
              'severity_4', sc.severity_4,
              'severity_5', sc.severity_5
          )
      ) AS violation_types_count,
      COALESCE(SUM(vc.violation_count * vc.severity), 0) AS score  -- Replace NULL score with 0
  FROM 
      user_violations uv
  LEFT JOIN 
      violation_counts vc ON uv.user_id = vc.violation_user_id
  LEFT JOIN
      severity_counts sc ON vc.violation_user_id = sc.user_id AND vc.violation_type = sc.violation_type
  GROUP BY 
      uv.user_id, uv.email, uv.total_violations
  ORDER BY 
      score DESC  -- Sort by score in descending order
  LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
