CREATE OR REPLACE FUNCTION get_scores(
    input_user_id TEXT, 
    from_date DATE DEFAULT CURRENT_DATE - INTERVAL '7 days', 
    to_date DATE DEFAULT CURRENT_DATE, 
    isFamily BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (                                                                                                      
    user_id UUID,                                                                                                    
    email TEXT,                                                                                                      
    total_violations INT,                                                                                            
    violation_types_count JSONB,                                                                                     
    score INT                                                                                                        
)                                                                                                                    
LANGUAGE plpgsql                                                                                                     
AS $$                                                                                                                
BEGIN                                                                                                                
  RETURN QUERY
  WITH violation_counts AS (
    SELECT
      v.user_id,  
      v.type AS violation_type,
      COALESCE(v.severity, 1) AS severity,
      COUNT(v.id)::INTEGER AS violation_count
    FROM 
      violations v
    WHERE 
      v.timestamp BETWEEN COALESCE(from_date, CURRENT_DATE - INTERVAL '7 days') 
                      AND COALESCE(to_date, CURRENT_DATE)
    GROUP BY 
      v.user_id, v.type, v.severity
  ),  
  user_violations AS (
    SELECT
      u.id AS user_id,  
      u.email,
      COUNT(v.id)::INTEGER AS total_violations
    FROM 
      users u
    LEFT JOIN 
      violations v ON u.id = v.user_id 
                  AND v.timestamp BETWEEN COALESCE(from_date, CURRENT_DATE - INTERVAL '7 days') 
                                      AND COALESCE(to_date, CURRENT_DATE)
    WHERE 
      u.id = CAST(input_user_id AS UUID) 
      OR (isFamily AND u.parent = CAST(input_user_id AS UUID))  -- Condición dinámica basada en isFamily
    GROUP BY 
      u.id, u.email
  ),  
  severity_counts AS (
    SELECT
      vc.user_id,  
      vc.violation_type,
      SUM(CASE WHEN vc.severity = 1 THEN vc.violation_count ELSE 0 END)::INTEGER AS severity_1,
      SUM(CASE WHEN vc.severity = 2 THEN vc.violation_count ELSE 0 END)::INTEGER AS severity_2,
      SUM(CASE WHEN vc.severity = 3 THEN vc.violation_count ELSE 0 END)::INTEGER AS severity_3,
      SUM(CASE WHEN vc.severity = 4 THEN vc.violation_count ELSE 0 END)::INTEGER AS severity_4,
      SUM(CASE WHEN vc.severity = 5 THEN vc.violation_count ELSE 0 END)::INTEGER AS severity_5
    FROM
      violation_counts vc
    GROUP BY
      vc.user_id, vc.violation_type
  )
  SELECT
      uv.user_id,  
      uv.email,
      COALESCE(uv.total_violations, 0)::INTEGER AS total_violations,
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
      COALESCE(SUM(vc.violation_count * vc.severity), 0)::INTEGER AS score
  FROM 
      user_violations uv
  LEFT JOIN 
      violation_counts vc ON uv.user_id = vc.user_id
  LEFT JOIN
      severity_counts sc ON vc.user_id = sc.user_id 
                        AND vc.violation_type = sc.violation_type
  GROUP BY 
      uv.user_id, uv.email, uv.total_violations
  ORDER BY 
      score DESC
  LIMIT 50;                                                                                                         
END;                                                                                                                 
$$;
