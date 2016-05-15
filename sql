'''
    ParkingPlan is a program that maps the parking schedules across the streets of the World.
    Copyright (C) <2016>  <Evgeniy Ivlev>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

    You can contact me at jenia.ivlev@gmail.com.
'''




SELECT DISTINCT STREET.ID AS ID,
                ST_AsText(scale_LineString(street.geom)) as geom,
                street_side,
                CASE WHEN    AND (DATE '%s', DATE '%s') OVERLAPS (cs.start_date, cs.end_date)
                             AND (TIME '%s', TIME '%s') OVERLAPS (start_time, end_time)
                             AND EXTRACT(DOW FROM DATE '%s') IN (day))
                THEN 'FALSE'
                ELSE 'TRUE'
                END AS allowed
FROM
       montreal_blocks as street,
       city_street_has_schedules as cshs,
       city_schedules as cs, 
       unnest(start_times, end_times, days) as u(start_time, end_time, day)
WHERE
       ST_DWITHIN  (
          st_transform(street.geom, 900913),
          st_transform(ST_GeomFromText('%s', 4326), 900913),
          350
      )
      AND cshs.montreal_block_id = street.id
      AND cshs.city_schedule_id = cs.id
      GROUP BY ([IF side1 OR side2 allowed, the alloweded, otherwise not-allowed])
