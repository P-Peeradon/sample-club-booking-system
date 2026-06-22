import { getPool } from '../lib/db';

async function test() {
  try {
    const [rows] = await getPool().query(
      "select `clubs`.`club_id`, `clubs`.`name`, `clubs`.`category`, `clubs`.`icon`, `clubs`.`desc`, count(`club_members`.`student_id`) from `clubs` left join `club_members` on `clubs`.`club_id` = `club_members`.`club_id` group by `clubs`.`club_id` order by `clubs`.`club_id`"
    );
    console.log(rows);
  } catch (err: any) {
    console.error(err);
  }
  process.exit();
}
test();
