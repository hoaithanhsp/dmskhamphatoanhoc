import { NumerologyProfile } from "../types";

// Helper: Calculate sum of digits recursively until single digit (or 11, 22, 33)
const reduceNumber = (num: number): number => {
  if (num === 11 || num === 22 || num === 33) return num;
  if (num < 10) return num;
  
  let sum = 0;
  const digits = num.toString().split('');
  digits.forEach(d => sum += parseInt(d));
  
  return reduceNumber(sum);
};

// Calculate Life Path Number (Số Đường Đời) from DOB (Support both YYYY-MM-DD and DD/MM/YYYY)
export const calculateLifePath = (dob: string): number => {
  if (!dob) return 0;
  
  // Extract only digits
  const digits = dob.replace(/\D/g, '');
  
  // Basic validation
  if (digits.length < 6) return 0; 
  
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    sum += parseInt(digits[i]);
  }
  
  return reduceNumber(sum);
};

// Knowledge Base from PDF - Detailed 10 Fields
const NUMEROLOGY_DATA: Record<number, Omit<NumerologyProfile, 'lifePathNumber'>> = {
  1: {
    title: "SỐ 1: NGƯỜI TIÊN PHONG",
    overview: "Con sở hữu ý chí mạnh mẽ, độc lập và luôn muốn dẫn đầu. Con là người tự chủ, quyết đoán và không ngại thử thách mới.",
    learningStyle: "Tự học, tự nghiên cứu, học qua dự án cá nhân. Thích được giao 'nhiệm vụ' hơn là bài tập đơn thuần.",
    aptitude: "Cao khi được làm việc độc lập. Dễ mất tập trung khi bị ép làm điều không thích hoặc môi trường gò bó.",
    motivation: "Mong muốn được công nhận, chiến thắng, trở thành người giỏi nhất. Thích cạnh tranh lành mạnh.",
    mathApproach: "Logic, thẳng thắn, tìm cách giải quyết nhanh và hiệu quả nhất. Thích các bài toán có đáp án duy nhất và rõ ràng.",
    strengths: [
      "Tư duy độc lập, không đi theo lối mòn.",
      "Quyết tâm cao, theo đuổi mục tiêu đến cùng.",
      "Có khả năng lãnh đạo nhóm học tập."
    ],
    challenges: [
      "Cái tôi cao, đôi khi khó tiếp thu ý kiến.",
      "Thiếu kiên nhẫn, khó lắng nghe người khác.",
      "Dễ trở nên hung hăng nếu bị phê bình."
    ],
    effectiveMethod: "Đặt mục tiêu rõ ràng, thách thức bản thân. Tự tạo các 'nhiệm vụ' cá nhân thay vì làm theo lệnh.",
    environment: "Không gian riêng, yên tĩnh. Môi trường tự do lựa chọn cách học, có cơ hội thể hiện năng lực.",
    conclusion: "Con là một nhà lãnh đạo bẩm sinh. Hãy khuyến khích con tự chủ trong việc học, đặt ra các mục tiêu cao để chinh phục."
  },
  2: {
    title: "SỐ 2: NGƯỜI HÒA GIẢI",
    overview: "Con là người nhạy cảm, tinh tế, giàu lòng trắc ẩn và yêu hòa bình. Con thích sự kết nối và hỗ trợ người khác.",
    learningStyle: "Học nhóm, học có bạn đồng hành. Học qua việc giải thích cho người khác.",
    aptitude: "Cao trong môi trường yên tĩnh, ổn định. Dễ bị phân tâm bởi cảm xúc và mối quan hệ xung quanh.",
    motivation: "Mong muốn được giúp đỡ, kết nối và nhận được sự yêu thương. Thích được công nhận từ thầy cô và bạn bè.",
    mathApproach: "Tuần tự, cẩn thận, tỉ mỉ. Thích những bài toán có hướng dẫn rõ ràng từng bước.",
    strengths: [
      "Khả năng lắng nghe và thấu cảm tuyệt vời.",
      "Giỏi làm việc nhóm, kết nối mọi người.",
      "Trực giác tốt, nhạy bén với cảm xúc."
    ],
    challenges: [
      "Quá nhạy cảm, dễ bị tổn thương bởi lời nói.",
      "Thiếu quyết đoán, hay do dự.",
      "Dễ lo lắng thái quá trước kỳ thi."
    ],
    effectiveMethod: "Học cùng bạn, giải thích lại cho bạn để hiểu sâu hơn. Sử dụng phương pháp học từng bước, có hệ thống.",
    environment: "Hài hòa, không căng thẳng. Có sự hỗ trợ từ bạn bè, thầy cô.",
    conclusion: "Con học tốt nhất khi cảm thấy an toàn và được yêu thương. Hãy tạo môi trường học tập nhẹ nhàng, khuyến khích học nhóm."
  },
  3: {
    title: "SỐ 3: NGƯỜI TRUYỀN CẢM HỨNG",
    overview: "Con là người sáng tạo, hoạt ngôn, lạc quan và tràn đầy năng lượng. Con thích sự vui vẻ và ghét sự nhàm chán.",
    learningStyle: "Học qua hình ảnh, âm nhạc, câu chuyện, trò chơi (Gamification). Thích môi trường vui vẻ, năng động.",
    aptitude: "Thấp nếu bài học nhàm chán. Dễ bị phân tâm bởi các kích thích xung quanh.",
    motivation: "Niềm vui, sự hứng thú, được thể hiện bản thân. Thích học những thứ có thể trình bày, chia sẻ.",
    mathApproach: "Sáng tạo, tìm những lối đi bất ngờ. Không thích đi theo khuôn mẫu. Thường 'nhảy bước' trong suy nghĩ.",
    strengths: [
      "Óc sáng tạo và trí tưởng tượng bay bổng.",
      "Kỹ năng giao tiếp và diễn đạt xuất sắc.",
      "Lạc quan, luôn mang năng lượng tích cực."
    ],
    challenges: [
      "Dễ mất tập trung, cả thèm chóng chán.",
      "Thiếu kỷ luật, hay trì hoãn công việc.",
      "Nói nhiều hơn làm, đôi khi hời hợt."
    ],
    effectiveMethod: "Biến học tập thành trò chơi. Sử dụng nhiều phương tiện đa phương tiện (video, hình ảnh).",
    environment: "Vui vẻ, năng động, đầy màu sắc. Cho phép di chuyển, không ngồi yên một chỗ.",
    conclusion: "Hãy để trí tưởng tượng của con bay xa. Toán học sẽ thú vị hơn qua các câu đố vui và hình ảnh sinh động."
  },
  4: {
    title: "SỐ 4: NGƯỜI XÂY DỰNG",
    overview: "Con là người thực tế, kỷ luật, chi tiết và đáng tin cậy. Con thích sự rõ ràng, trật tự và logic chặt chẽ.",
    learningStyle: "Học có cấu trúc rõ ràng, theo quy trình, từng bước một. Thích lịch trình ổn định, lặp lại đều đặn.",
    aptitude: "Cao, đặc biệt với những công việc chi tiết. Có thể tập trung lâu nếu biết rõ mục tiêu.",
    motivation: "Muốn xây dựng nền móng vững chắc, thấy kết quả cụ thể từng bước. Thích sự ổn định và có thể dự đoán được.",
    mathApproach: "Tuân tự, có hệ thống, từng bước một. Không bỏ qua bất kỳ bước nào. Kiểm tra lại nhiều lần để đảm bảo chính xác.",
    strengths: [
      "Làm việc chăm chỉ, kiên định.",
      "Tổ chức tốt, có kế hoạch rõ ràng.",
      "Chi tiết, cẩn thận, chính xác cao."
    ],
    challenges: [
      "Cứng nhắc, khó thay đổi khi đã quen.",
      "Quá lo lắng về chi tiết, thiếu cái nhìn tổng thể.",
      "Sợ rủi ro, ngại ý kiến khác."
    ],
    effectiveMethod: "Lập kế hoạch học tập chi tiết. Chia nhỏ mục tiêu thành các bước nhỏ. Sử dụng checklist.",
    environment: "Có cấu trúc rõ ràng, ổn định. Quy tắc nhất quán, không thay đổi đột ngột.",
    conclusion: "Con là nền tảng vững chắc của mọi việc. Hãy cung cấp lộ trình học tập rõ ràng, logic để con phát huy tối đa."
  },
  5: {
    title: "SỐ 5: NGƯỜI TỰ DO",
    overview: "Con yêu tự do, thích khám phá, đa tài và linh hoạt. Con ghét sự gò bó và luôn tìm kiếm trải nghiệm mới.",
    learningStyle: "Học qua trải nghiệm, thám hiểm, khám phá. Cần sự đa dạng, thay đổi liên tục.",
    aptitude: "Rất thấp với những chủ đề nhàm chán. Dễ bị bồn chồn, muốn chuyển sang thứ khác.",
    motivation: "Khám phá mới mẻ, trải nghiệm đa dạng, được tự do chọn lựa. Thích phiêu lưu và bất ngờ.",
    mathApproach: "Thử nhiều cách, nhảy qua nhảy lại. Không theo trình tự cố định. Thích giải quyết nhanh để chuyển sang vấn đề khác.",
    strengths: [
      "Thích nghi nhanh với môi trường mới.",
      "Linh hoạt, đa tài.",
      "Tò mò, ham học hỏi."
    ],
    challenges: [
      "Thiếu kiên nhẫn, không kiên định.",
      "Dễ bòn chồn, không chịu ràng buộc.",
      "Dễ phân tâm bởi nhiều thứ cùng lúc."
    ],
    effectiveMethod: "Thay đổi phương pháp học thường xuyên. Kết hợp nhiều môn học, nhiều kỹ năng.",
    environment: "Tự do, không gò bó. Nhiều sự lựa chọn, tính bất ngờ cao.",
    conclusion: "Đừng ép con ngồi yên một chỗ. Hãy cho con thấy toán học là một cuộc phiêu lưu thú vị để khám phá thế giới."
  },
  6: {
    title: "SỐ 6: NGƯỜI CHĂM SÓC",
    overview: "Con là người có trách nhiệm, yêu thương, quan tâm đến người khác. Con luôn mong muốn sự hoàn hảo và hài hòa.",
    learningStyle: "Học qua việc chăm sóc, giúp đỡ người khác. Thích các bài học có ý nghĩa nhân văn.",
    aptitude: "Cao khi học những gì có ý nghĩa với gia đình/cộng đồng. Dễ bị phân tâm bởi nhu cầu chăm sóc người khác.",
    motivation: "Giúp đỡ người khác, làm điều có ý nghĩa, được yêu thương. Muốn trở thành người có ích.",
    mathApproach: "Liên hệ với cuộc sống thực tế. Ứng dụng vào việc giúp đỡ người khác. Giải quyết vấn đề có tính nhân văn.",
    strengths: [
      "Giàu lòng trắc ẩn, quan tâm người khác.",
      "Trách nhiệm cao, chu đáo.",
      "Sáng tạo nghệ thuật, thẩm mỹ cao."
    ],
    challenges: [
      "Lo lắng quá mức, đặc biệt cho người khác.",
      "Can thiệp thái quá, ôm đồm.",
      "Dễ bị lợi dụng lòng tốt."
    ],
    effectiveMethod: "Học qua việc dạy lại cho người khác. Tham gia các dự án cộng đồng, tình nguyện.",
    environment: "Ấm áp, hỗ trợ lẫn nhau. Có ý nghĩa nhân văn.",
    conclusion: "Con học giỏi nhất khi cảm thấy kiến thức đó giúp ích cho mọi người. Hãy gắn toán học với các giá trị cuộc sống."
  },
  7: {
    title: "SỐ 7: NGƯỜI TRÍ TUỆ",
    overview: "Con là người sâu sắc, thích phân tích, tìm tòi chân lý. Con có xu hướng đặt câu hỏi 'Tại sao' và muốn hiểu bản chất.",
    learningStyle: "Học qua nghiên cứu sâu, phân tích, tìm hiểu bản chất. Cần không gian yên tĩnh để suy ngẫm.",
    aptitude: "Rất cao khi học một mình, không bị làm phiền. Có thể tập trung sâu trong thời gian dài.",
    motivation: "Hiểu 'tại sao', khám phá bí ẩn, đạt đến sự thật. Thích tìm hiểu bản chất, nguồn gốc vấn đề.",
    mathApproach: "Phân tích từng chi tiết, tìm hiểu bản chất. Cần biết 'tại sao' trước khi làm. Suy ngẫm kỹ trước khi đưa ra kết luận.",
    strengths: [
      "Phân tích sâu sắc, logic.",
      "Trực giác mạnh mẽ.",
      "Độc lập tinh thần, tự học tốt."
    ],
    challenges: [
      "Xu hướng cô độc, xa cách.",
      "Hoài nghi quá mức, khó tin người.",
      "Khó chia sẻ cảm xúc, suy nghĩ."
    ],
    effectiveMethod: "Nghiên cứu chuyên sâu, đọc nhiều sách. Suy ngẫm, chiêm nghiệm một mình.",
    environment: "Yên tĩnh, sâu lắng. Không bị làm phiền, có không gian riêng.",
    conclusion: "Con là một nhà tư tưởng. Hãy cung cấp sách, tài liệu chuyên sâu và không gian riêng để con tự do khám phá tri thức."
  },
  8: {
    title: "SỐ 8: NGƯỜI LÃNH ĐẠO",
    overview: "Con mạnh mẽ, thực tế, có tố chất kinh doanh và lãnh đạo. Con nhạy bén với các con số, tài chính và thích thành công.",
    learningStyle: "Học có mục tiêu rõ ràng, đo lường được thành công. Thích học những gì mang lại lợi ích cụ thể.",
    aptitude: "Cao khi thấy mục tiêu rõ ràng và có ý nghĩa. Kiên trì với những gì mang lại thành công.",
    motivation: "Thành công, giàu có, quyền lực, danh vọng. Muốn đạt được vị thế cao.",
    mathApproach: "Hiệu quả, nhanh chóng, tập trung kết quả. Áp dụng chiến lược, tính toán lợi ích.",
    strengths: [
      "Lãnh đạo mạnh mẽ, quyết đoán.",
      "Tham vọng lớn, không ngừng nỗ lực.",
      "Tổ chức tốt, quản lý thời gian hiệu quả."
    ],
    challenges: [
      "Háo danh, thích quyền lực quá mức.",
      "Vật chất hóa giá trị học tập.",
      "Bỏ bê cảm xúc, mối quan hệ."
    ],
    effectiveMethod: "Đặt mục tiêu cụ thể, đo lường được. Học những gì có giá trị thực tế.",
    environment: "Môi trường chuyên nghiệp, nghiêm túc. Có cơ hội thể hiện năng lực lãnh đạo.",
    conclusion: "Hãy đặt ra những mục tiêu thách thức và phần thưởng xứng đáng. Con sẽ nỗ lực hết mình để chinh phục đỉnh cao."
  },
  9: {
    title: "SỐ 9: NGƯỜI NHÂN ÁI",
    overview: "Con bao dung, nhân hậu, có tầm nhìn lớn và lý tưởng cao đẹp. Con muốn cống hiến cho cộng đồng và thế giới.",
    learningStyle: "Học có ý nghĩa nhân văn sâu sắc, liên quan đến việc giúp đỡ thế giới. Thích học những gì có giá trị cho cộng đồng.",
    aptitude: "Cao khi học những gì có ý nghĩa lớn lao. Khó tập trung với những điều nhỏ nhặt, chi tiết.",
    motivation: "Cống hiến cho cộng đồng, thay đổi thế giới, giúp đỡ người khác. Lý tưởng cao đẹp, tính nhân văn.",
    mathApproach: "Nhìn tổng thể, kết nối với bức tranh lớn. Tìm ý nghĩa sâu xa của vấn đề.",
    strengths: [
      "Lòng trắc ẩn sâu sắc, vị tha.",
      "Nhìn xa, có tầm nhìn rộng.",
      "Sáng tạo, trí tuệ cảm xúc cao."
    ],
    challenges: [
      "Lãnh đạm bằng tấm gương, truyền cảm hứng.",
      "Dễ thất vọng khi không đạt được lý tưởng.",
      "Hy sinh thái quá, quên bản thân."
    ],
    effectiveMethod: "Kết nối kiến thức với vấn đề xã hội. Học qua dự án cộng đồng.",
    environment: "Có ý nghĩa nhân văn sâu sắc. Liên quan đến cộng đồng, xã hội.",
    conclusion: "Con có trái tim lớn. Hãy giúp con thấy được ý nghĩa cao đẹp của việc học đối với việc xây dựng một thế giới tốt đẹp hơn."
  },
  11: {
    title: "SỐ 11: BẬC THẦY TRỰC GIÁC",
    overview: "Con sở hữu trực giác nhạy bén, khả năng tâm linh và thấu hiểu sâu sắc. Con là người truyền cảm hứng bẩm sinh.",
    learningStyle: "Học qua trực giác, cảm nhận, kết nối tâm linh. Nhận biết patterns (mẫu hình) một cách trực quan.",
    aptitude: "Cao khi môi trường yên bình, tâm linh. Dễ bị áp lực cao làm mất tập trung.",
    motivation: "Giác ngộ, kết nối vũ trụ qua con số, truyền cảm hứng. Tìm kiếm sự thật sâu xa, ý nghĩa siêu hình.",
    mathApproach: "Trực giác trước, logic sau. Thấy mẫu hình, quy luật một cách trực quan.",
    strengths: [
      "Trực giác siêu phàm, nhạy bén cực độ.",
      "Khả năng nhận dạng patterns xuất sắc.",
      "Sáng tạo phi thường."
    ],
    challenges: [
      "Căng thẳng thần kinh, áp lực kỳ vọng cao.",
      "Quá nhạy cảm với môi trường xung quanh.",
      "Mộng mơ, thiếu thực tế."
    ],
    effectiveMethod: "Tin vào trực giác, cảm nhận của mình. Học qua thiền định, yoga, mindfulness.",
    environment: "Yên bình, tâm linh. Khuyến khích trực giác, cảm nhận.",
    conclusion: "Con có món quà đặc biệt là trực giác. Hãy khuyến khích con tin vào cảm nhận của mình trong cả học tập và cuộc sống."
  },
  22: {
    title: "SỐ 22: KIẾN TRÚC SƯ ĐẠI TÀI",
    overview: "Con kết hợp tầm nhìn xa của số 11 và tính thực tế của số 4. Con có khả năng biến những giấc mơ lớn thành hiện thực.",
    learningStyle: "Học qua dự án lớn, kế hoạch dài hạn, xây dựng hệ thống. Thích các mục tiêu vĩ đại có tính thực tiễn cao.",
    aptitude: "Rất cao với các dự án lớn, có ý nghĩa. Kiên trì dài hạn với mục tiêu vĩ đại.",
    motivation: "Xây dựng nền móng cho tương lai, tạo ra điều vĩ đại. Tác động lớn, thay đổi hệ thống.",
    mathApproach: "Hệ thống + tầm nhìn. Từng bước nhưng hướng đến mục tiêu lớn. Kết hợp trực giác và logic.",
    strengths: [
      "Tham vọng lớn có tính thực tế.",
      "Tổ chức xuất sắc, quản lý dự án tốt.",
      "Kiên định phi thường với mục tiêu lớn."
    ],
    challenges: [
      "Áp lực cao từ bản thân và người khác.",
      "Căng thẳng vì mục tiêu quá lớn.",
      "Có thể trở nên cứng nhắc."
    ],
    effectiveMethod: "Lập kế hoạch dài hạn, từng giai đoạn. Học qua các dự án lớn, có tác động rộng.",
    environment: "Có mục tiêu lớn, tầm ảnh hưởng rộng. Môi trường nghiêm túc, chuyên nghiệp.",
    conclusion: "Con có tiềm năng làm nên những điều vĩ đại. Hãy giúp con chia nhỏ những giấc mơ lớn thành kế hoạch hành động cụ thể."
  },
  33: {
    title: "SỐ 33: NGƯỜI CHỮA LÀNH",
    overview: "Con mang năng lượng yêu thương vô điều kiện và sự hy sinh. Con muốn chữa lành và nuôi dưỡng tâm hồn mọi người.",
    learningStyle: "Học qua sự yêu thương, chăm sóc, chữa lành. Kết hợp nghệ thuật và sự tận tâm.",
    aptitude: "Cao khi được chăm sóc, nuôi dưỡng người khác. Nhạy cảm với nỗi đau của người khác.",
    motivation: "Mang lại tình yêu, sự chữa lành cho thế giới. Phục vụ cộng đồng với tình yêu vô điều kiện.",
    mathApproach: "Tiếp cận bằng trái tim, sự thấu hiểu. Tìm kiếm sự hài hòa và vẻ đẹp trong các con số.",
    strengths: [
      "Tình yêu thương bao la, vô điều kiện.",
      "Khả năng chữa lành, nuôi dưỡng.",
      "Sáng tạo và nghệ thuật cao."
    ],
    challenges: [
      "Quá hy sinh bản thân, quên mình.",
      "Gánh vác quá nhiều nỗi đau của người khác.",
      "Dễ bị cảm xúc chi phối."
    ],
    effectiveMethod: "Kết hợp học tập với nghệ thuật, chữa lành. Tham gia các hoạt động thiện nguyện.",
    environment: "Tràn đầy tình yêu thương, sự chấp nhận. Không cạnh tranh, chỉ có sự hỗ trợ.",
    conclusion: "Tình yêu thương là sức mạnh lớn nhất của con. Hãy dùng nó để lan tỏa niềm vui và sự chữa lành trong học tập và cuộc sống."
  }
};

export const analyzeProfile = (name: string, dob: string): NumerologyProfile => {
  const lifePath = calculateLifePath(dob);
  
  // Default to Number 1 data if something goes wrong, but calculations should be robust
  const baseProfile = NUMEROLOGY_DATA[lifePath] || NUMEROLOGY_DATA[1];

  return {
    lifePathNumber: lifePath,
    ...baseProfile
  };
};